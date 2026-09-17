import { type AxiosInstance } from 'axios';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  AppConnectionAuthFailedError,
  getConnection,
  kv,
  reportConnectionAuthFailure,
} from 'twenty-sdk/logic-function';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { SYNC_CONTACTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { attachCompanyIds } from 'src/logic-functions/data/attach-company-ids.util';
import { chunk } from 'src/logic-functions/data/chunk.util';
import { executeWithRetry } from 'src/logic-functions/data/execute-with-retry.util';
import { GoogleAuthFailedError } from 'src/logic-functions/data/google-auth-failed.error';
import {
  callGoogle,
  createGoogleClient,
  describeGoogleError,
  readGoogleErrorStatus,
} from 'src/logic-functions/data/google-client.util';
import { fetchPeopleForSync } from 'src/logic-functions/data/fetch-people-for-sync.util';
import { mapGooglePerson } from 'src/logic-functions/data/map-google-person.util';
import { readGoogleOrganization } from 'src/logic-functions/data/read-google-organization.util';
import { readGoogleUpdateTime } from 'src/logic-functions/data/read-google-update-time.util';
import { resolveCompanyIds } from 'src/logic-functions/data/resolve-company-ids.util';
import {
  resolvePeopleToUpsert,
  type SyncCandidate,
} from 'src/logic-functions/data/resolve-people-to-upsert.util';
import { prepareUrl } from 'src/logic-functions/data/prepare-url.util';
import { type ListConnectionsResponse } from 'src/logic-functions/types/google-response.type';
import { BATCH_SIZE } from 'src/constants/batch-sizes.constant';

const SYNC_TOKEN_EXPIRED_STATUS = 410;

const fetchAndUpsertPeople = async ({
  axiosInstance,
  client,
  syncToken,
}: {
  axiosInstance: AxiosInstance;
  client: CoreApiClient;
  syncToken: string | null;
}): Promise<string | undefined> => {
  let pageToken: string | undefined;
  let nextSyncToken: string | undefined;

  const claimedPrimaryEmails = new Set<string>();

  do {
    const googleResponse = await callGoogle(() =>
      axiosInstance.get<ListConnectionsResponse>(
        prepareUrl({ syncToken, pageToken }),
      ),
    );

    const candidates: SyncCandidate[] = [];

    for (const person of googleResponse.data.connections ?? []) {
      if (person.metadata?.deleted) {
        continue;
      }

      const personInput = mapGooglePerson(person);

      if (!isDefined(personInput)) {
        continue;
      }

      candidates.push({
        personInput,
        googleUpdatedAt: readGoogleUpdateTime(person),
        organization: readGoogleOrganization(person),
      });
    }

    const existingPeople = await fetchPeopleForSync({
      client,
      googleContactsIds: candidates.map(
        ({ personInput }) => personInput.googleContactsId,
      ),
      primaryEmails: candidates
        .map(({ personInput }) => personInput.emails.primaryEmail)
        .filter(isNonEmptyString),
    });

    const resolvedPeople = resolvePeopleToUpsert({
      candidates,
      existingPeople,
      claimedPrimaryEmails,
    });

    const companyIdsByKey = await resolveCompanyIds({
      client,
      organizations: resolvedPeople
        .map(({ organization }) => organization)
        .filter(isDefined),
    });

    const peopleToUpsert = attachCompanyIds({
      resolvedPeople,
      companyIdsByKey,
    });

    for (const peopleBatch of chunk(peopleToUpsert, BATCH_SIZE)) {
      await executeWithRetry(() =>
        client.mutation({
          createPeople: {
            __args: { data: peopleBatch, upsert: true },
            id: true,
          },
        }),
      );
    }

    pageToken = googleResponse.data.nextPageToken;
    nextSyncToken = googleResponse.data.nextSyncToken ?? nextSyncToken;
  } while (isDefined(pageToken));

  return nextSyncToken;
};

const handler = async ({ connectionId }: { connectionId: string }) => {
  let accessToken: string;

  try {
    accessToken = (await getConnection(connectionId)).accessToken;
  } catch (error) {
    if (error instanceof AppConnectionAuthFailedError) {
      console.error(
        '[google-contacts] Skipping connection flagged as auth failed',
        connectionId,
      );

      return { status: 'auth-failed' };
    }

    throw error;
  }

  const syncToken = await kv.get<string>(connectionId);

  const client = new CoreApiClient();
  const axiosInstance = createGoogleClient(accessToken);

  let nextSyncToken: string | undefined;

  try {
    nextSyncToken = await fetchAndUpsertPeople({
      axiosInstance,
      client,
      syncToken,
    });
  } catch (error) {
    if (error instanceof GoogleAuthFailedError) {
      console.error(
        '[google-contacts] Connection needs to be reconnected',
        connectionId,
        error.message,
      );

      await reportConnectionAuthFailure({
        connectionId,
        reason: error.message,
      });

      return { status: 'auth-failed' };
    }

    if (readGoogleErrorStatus(error) !== SYNC_TOKEN_EXPIRED_STATUS) {
      console.error(
        '[google-contacts] Sync failed',
        connectionId,
        describeGoogleError(error),
      );

      throw error;
    }

    await kv.delete(connectionId);

    nextSyncToken = await fetchAndUpsertPeople({
      axiosInstance,
      client,
      syncToken: null,
    });
  }

  if (isNonEmptyString(nextSyncToken)) {
    await kv.set(connectionId, nextSyncToken);
  }

  console.log('[google-contacts] Sync finished', {
    connectionId,
    isIncremental: isNonEmptyString(syncToken),
  });

  return { status: 'synced' };
};

export default defineLogicFunction({
  universalIdentifier: SYNC_CONTACTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'sync-contacts',
  description:
    'Upserts the Google contacts of one connection into Twenty people, incrementally once a sync token is stored.',
  timeoutSeconds: 900,
  handler,
});
