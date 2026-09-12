import axios, { type AxiosInstance } from 'axios';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  AppConnectionAuthFailedError,
  getConnection,
  kv,
  reportConnectionAuthFailure,
  RoutePayload,
} from 'twenty-sdk/logic-function';

import { SYNC_CONTACTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { chunk } from 'src/logic-functions/data/chunk.util';
import { mapGooglePerson } from 'src/logic-functions/data/map-google-person.util';
import { prepareUrl } from 'src/logic-functions/data/prepare-url.util';
import { type ListConnectionsResponse } from 'src/logic-functions/types/google-response.type';
import { type TwentyPersonInput } from 'src/logic-functions/types/twenty-person.type';
import { isDefined } from "twenty-sdk/utils";
import { isNonEmptyString } from "@sniptt/guards";

const GOOGLE_PEOPLE_BASE_URL = 'https://people.googleapis.com/v1/people/me';
const GOOGLE_REQUEST_TIMEOUT_MILLISECONDS = 30_000;
const PEOPLE_UPSERT_BATCH_SIZE = 200;
const SYNC_TOKEN_EXPIRED_STATUS = 410;
const UNAUTHORIZED_STATUSES = [401, 403];

const readGoogleErrorStatus = (error: unknown): number | undefined =>
  axios.isAxiosError(error) ? error.response?.status : undefined;

const describeError = (error: unknown): unknown =>
  axios.isAxiosError(error)
    ? (error.response?.data ?? error.message)
    : error instanceof Error
      ? error.message
      : error;

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

  do {
    const googleResponse = await axiosInstance.get<ListConnectionsResponse>(
      prepareUrl(syncToken, pageToken),
    );

    const peopleToUpsert: TwentyPersonInput[] = [];

    for (const person of googleResponse.data.connections ?? []) {
      if (person.metadata?.deleted === true) {
        continue;
      }

      const personToUpsert = mapGooglePerson(person);

      if (!isDefined(personToUpsert)) {
        continue;
      }

      peopleToUpsert.push(personToUpsert);
    }

    for (const peopleBatch of chunk(peopleToUpsert, PEOPLE_UPSERT_BATCH_SIZE)) {
      await client.mutation({
        createPeople: {
          __args: { data: peopleBatch, upsert: true },
          id: true,
        },
      });
    }

    pageToken = googleResponse.data.nextPageToken;
    nextSyncToken = googleResponse.data.nextSyncToken ?? nextSyncToken;
  } while (isDefined(pageToken));

  return nextSyncToken;
};

const handler = async (payload: RoutePayload<{ connectionId: string }>) => {
  const connectionId = payload.body?.connectionId;

  if (isNonEmptyString(connectionId) === false) {
    return;
  }

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
  const axiosInstance = axios.create({
    baseURL: GOOGLE_PEOPLE_BASE_URL,
    timeout: GOOGLE_REQUEST_TIMEOUT_MILLISECONDS,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  let nextSyncToken: string | undefined;

  try {
    nextSyncToken = await fetchAndUpsertPeople({
      axiosInstance,
      client,
      syncToken,
    });
  } catch (error) {
    const status = readGoogleErrorStatus(error);

    if (status === SYNC_TOKEN_EXPIRED_STATUS) {
      await kv.delete(connectionId);

      nextSyncToken = await fetchAndUpsertPeople({
        axiosInstance,
        client,
        syncToken: null,
      });
    } else if (isDefined(status) && UNAUTHORIZED_STATUSES.includes(status)) {
      console.error(
        '[google-contacts] Connection needs to be reconnected',
        connectionId,
        describeError(error),
      );

      await reportConnectionAuthFailure({
        connectionId,
        reason: `Google People API returned ${status}`,
      });

      return { status: 'auth-failed' };
    } else {
      console.error(
        '[google-contacts] Sync failed',
        connectionId,
        describeError(error),
      );

      throw error;
    }
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
  httpRouteTriggerSettings: {
    path: '/sync-google-contacts',
    httpMethod: 'POST',
    isAuthRequired: true,
  }
});
