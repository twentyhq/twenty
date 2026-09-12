import { isNonEmptyString } from '@sniptt/guards';
import axios, { type AxiosInstance } from 'axios';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  AppConnectionAuthFailedError,
  findConnectionForRequest,
  getConnection,
  listConnections,
  reportConnectionAuthFailure,
  Response,
  RoutePayload,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { EXPORT_CONTACTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { chunk } from 'src/logic-functions/data/chunk.util';
import { mapTwentyPerson } from 'src/logic-functions/data/map-twenty-person.util';
import { type GoogleContactWriteInput } from 'src/logic-functions/types/google-request.type';
import {
  type BatchGetContactsResponse,
  type Person,
} from 'src/logic-functions/types/google-response.type';
import { type TwentyPersonRecord } from 'src/logic-functions/types/twenty-person.type';

const GOOGLE_PEOPLE_BASE_URL = 'https://people.googleapis.com/v1';
const GOOGLE_REQUEST_TIMEOUT_MILLISECONDS = 30_000;
const CONTACT_BATCH_GET_SIZE = 200;
const PEOPLE_QUERY_BATCH_SIZE = 200;
const CONCURRENT_CONTACT_WRITES = 5;
const UNAUTHORIZED_STATUSES = [401, 403];
const RETRYABLE_STATUSES = [429, 500, 502, 503];
const CONTACT_WRITE_RETRIES = 2;
const RETRY_BASE_DELAY_MILLISECONDS = 1_000;
// One synchronous request has to answer the user, and the Google People API
// throttles writes per minute, so the selection is bounded rather than
// silently truncated.
const MAX_EXPORTED_CONTACTS = 200;

const EXISTING_CONTACT_PERSON_FIELDS = 'organizations,urls';
const CREATED_CONTACT_PERSON_FIELDS = 'names';

type ExportContactsBody = {
  personIds?: string[];
};

type ContactWriteOutcome = {
  personId: string;
  resourceName?: string;
  wasCreated: boolean;
};

class GoogleAuthFailedError extends Error {
  constructor(readonly status: number) {
    super(`Google People API returned ${status}`);
    this.name = 'GoogleAuthFailedError';
  }
}

const readGoogleErrorStatus = (error: unknown): number | undefined =>
  axios.isAxiosError(error) ? error.response?.status : undefined;

const describeError = (error: unknown): unknown =>
  axios.isAxiosError(error)
    ? (error.response?.data ?? error.message)
    : error instanceof Error
      ? error.message
      : error;

const wait = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const readRetryDelay = (error: unknown, attempt: number): number => {
  const retryAfterHeader = axios.isAxiosError(error)
    ? error.response?.headers?.['retry-after']
    : undefined;
  const retryAfterSeconds = Number(retryAfterHeader);

  return Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
    ? retryAfterSeconds * 1_000
    : RETRY_BASE_DELAY_MILLISECONDS * 2 ** attempt;
};

// Google throttles contact writes per minute; backing off keeps a large
// selection from being reported as a wall of failures.
const callGoogle = async <TResult>(
  request: () => Promise<TResult>,
): Promise<TResult> => {
  for (let attempt = 0; ; attempt++) {
    try {
      return await request();
    } catch (error) {
      const status = readGoogleErrorStatus(error);

      if (isDefined(status) && UNAUTHORIZED_STATUSES.includes(status)) {
        throw new GoogleAuthFailedError(status);
      }

      if (
        attempt >= CONTACT_WRITE_RETRIES ||
        !isDefined(status) ||
        !RETRYABLE_STATUSES.includes(status)
      ) {
        throw error;
      }

      await wait(readRetryDelay(error, attempt));
    }
  }
};

const jsonResponse = (body: unknown, status: number): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const fetchPeople = async (
  client: CoreApiClient,
  personIds: string[],
): Promise<TwentyPersonRecord[]> => {
  const people: TwentyPersonRecord[] = [];

  for (const personIdsBatch of chunk(personIds, PEOPLE_QUERY_BATCH_SIZE)) {
    const { people: peoplePage } = await client.query({
      people: {
        __args: {
          filter: { id: { in: personIdsBatch } },
          first: personIdsBatch.length,
        },
        edges: {
          node: {
            id: true,
            googleContactsId: true,
            jobTitle: true,
            name: { firstName: true, lastName: true },
            emails: { primaryEmail: true, additionalEmails: true },
            phones: {
              primaryPhoneNumber: true,
              primaryPhoneCallingCode: true,
              additionalPhones: true,
            },
            linkedinLink: { primaryLinkUrl: true },
            xLink: { primaryLinkUrl: true },
            company: { name: true },
          },
        },
      },
    });

    for (const edge of peoplePage?.edges ?? []) {
      people.push(edge.node as TwentyPersonRecord);
    }
  }

  return people;
};

// Keyed by the resource name we asked for: Google answers a merged contact
// under its canonical name, and the update has to target that canonical one.
const fetchExistingContacts = async (
  axiosInstance: AxiosInstance,
  googleContactsIds: string[],
): Promise<Map<string, Person>> => {
  const contactsByRequestedResourceName = new Map<string, Person>();

  for (const idsBatch of chunk(googleContactsIds, CONTACT_BATCH_GET_SIZE)) {
    const searchParams = new URLSearchParams({
      personFields: EXISTING_CONTACT_PERSON_FIELDS,
    });

    for (const googleContactsId of idsBatch) {
      searchParams.append('resourceNames', `people/${googleContactsId}`);
    }

    const googleResponse = await callGoogle(() =>
      axiosInstance.get<BatchGetContactsResponse>(
        `/people:batchGet?${searchParams.toString()}`,
      ),
    );

    for (const personResponse of googleResponse.data.responses ?? []) {
      const contact = personResponse.person;

      if (
        !isDefined(contact) ||
        !isNonEmptyString(contact.etag) ||
        !isNonEmptyString(personResponse.requestedResourceName)
      ) {
        continue;
      }

      contactsByRequestedResourceName.set(
        personResponse.requestedResourceName,
        contact,
      );
    }
  }

  return contactsByRequestedResourceName;
};

const createContact = async (
  axiosInstance: AxiosInstance,
  contact: GoogleContactWriteInput,
): Promise<string> => {
  const googleResponse = await callGoogle(() =>
    axiosInstance.post<Person>(
      `/people:createContact?personFields=${CREATED_CONTACT_PERSON_FIELDS}`,
      contact,
    ),
  );

  return googleResponse.data.resourceName;
};

const updateContact = async (
  axiosInstance: AxiosInstance,
  existingContact: Person,
  contact: GoogleContactWriteInput,
): Promise<void> => {
  const updatePersonFields = Object.keys(contact).join(',');

  await callGoogle(() =>
    axiosInstance.patch(
      `/${existingContact.resourceName}:updateContact?updatePersonFields=${updatePersonFields}`,
      { ...contact, etag: existingContact.etag },
    ),
  );
};

const writeContact = async (
  axiosInstance: AxiosInstance,
  person: TwentyPersonRecord,
  existingContact: Person | undefined,
): Promise<ContactWriteOutcome | undefined> => {
  const contact = mapTwentyPerson(person, existingContact);

  if (Object.keys(contact).length === 0) {
    return undefined;
  }

  if (isDefined(existingContact)) {
    await updateContact(axiosInstance, existingContact, contact);

    return { personId: person.id, wasCreated: false };
  }

  const resourceName = await createContact(axiosInstance, contact);

  return { personId: person.id, resourceName, wasCreated: true };
};

// The contact already exists in Google at this point, so a failed link is
// logged rather than thrown: the next incremental sync would otherwise
// reimport it as a second person.
const linkCreatedContacts = async (
  client: CoreApiClient,
  outcomes: ContactWriteOutcome[],
): Promise<void> => {
  for (const outcome of outcomes) {
    if (!isNonEmptyString(outcome.resourceName)) {
      continue;
    }

    try {
      await client.mutation({
        updatePerson: {
          __args: {
            id: outcome.personId,
            data: {
              googleContactsId: outcome.resourceName.replace('people/', ''),
            },
          },
          id: true,
        },
      });
    } catch (error) {
      console.error(
        '[google-contacts] Failed to link a created contact',
        outcome.personId,
        outcome.resourceName,
        describeError(error),
      );
    }
  }
};

const exportPeople = async ({
  axiosInstance,
  client,
  people,
}: {
  axiosInstance: AxiosInstance;
  client: CoreApiClient;
  people: TwentyPersonRecord[];
}): Promise<{ created: number; updated: number; failed: number }> => {
  const existingContacts = await fetchExistingContacts(
    axiosInstance,
    people.map((person) => person.googleContactsId).filter(isNonEmptyString),
  );

  let created = 0;
  let updated = 0;
  let failed = 0;

  for (const peopleBatch of chunk(people, CONCURRENT_CONTACT_WRITES)) {
    const settledWrites = await Promise.allSettled(
      peopleBatch.map((person) =>
        writeContact(
          axiosInstance,
          person,
          // A contact deleted on the Google side drops out of the batch get,
          // so the person is recreated instead of failing forever.
          isNonEmptyString(person.googleContactsId)
            ? existingContacts.get(`people/${person.googleContactsId}`)
            : undefined,
        ),
      ),
    );

    const outcomes: ContactWriteOutcome[] = [];

    for (const settledWrite of settledWrites) {
      if (settledWrite.status === 'rejected') {
        if (settledWrite.reason instanceof GoogleAuthFailedError) {
          throw settledWrite.reason;
        }

        failed += 1;

        console.error(
          '[google-contacts] Failed to export a contact',
          describeError(settledWrite.reason),
        );

        continue;
      }

      if (!isDefined(settledWrite.value)) {
        continue;
      }

      outcomes.push(settledWrite.value);

      if (settledWrite.value.wasCreated) {
        created += 1;
      } else {
        updated += 1;
      }
    }

    await linkCreatedContacts(client, outcomes);
  }

  return { created, updated, failed };
};

const handler = async (payload: RoutePayload<ExportContactsBody>) => {
  const personIds = [...new Set(payload.body?.personIds ?? [])].filter(
    isNonEmptyString,
  );

  if (personIds.length === 0) {
    return jsonResponse({ status: 'no-contacts-selected' }, 400);
  }

  if (personIds.length > MAX_EXPORTED_CONTACTS) {
    return jsonResponse(
      { status: 'too-many-contacts', limit: MAX_EXPORTED_CONTACTS },
      200,
    );
  }

  const connection = findConnectionForRequest(
    await listConnections({ providerName: 'google-contacts' }),
    payload,
  );

  if (!isDefined(connection)) {
    return jsonResponse({ status: 'no-connection' }, 200);
  }

  let accessToken: string;

  try {
    accessToken = (await getConnection(connection.id)).accessToken;
  } catch (error) {
    if (error instanceof AppConnectionAuthFailedError) {
      return jsonResponse({ status: 'auth-failed' }, 200);
    }

    throw error;
  }

  const client = new CoreApiClient();
  const people = await fetchPeople(client, personIds);

  if (people.length === 0) {
    return jsonResponse({ status: 'no-contacts-found' }, 200);
  }

  const axiosInstance = axios.create({
    baseURL: GOOGLE_PEOPLE_BASE_URL,
    timeout: GOOGLE_REQUEST_TIMEOUT_MILLISECONDS,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  try {
    const { created, updated, failed } = await exportPeople({
      axiosInstance,
      client,
      people,
    });

    console.log('[google-contacts] Export finished', {
      connectionId: connection.id,
      created,
      updated,
      failed,
    });

    return jsonResponse({ status: 'exported', created, updated, failed }, 200);
  } catch (error) {
    if (error instanceof GoogleAuthFailedError) {
      console.error(
        '[google-contacts] Connection needs to be reconnected',
        connection.id,
        error.message,
      );

      await reportConnectionAuthFailure({
        connectionId: connection.id,
        reason: error.message,
      });

      return jsonResponse({ status: 'auth-failed' }, 200);
    }

    console.error(
      '[google-contacts] Export failed',
      connection.id,
      describeError(error),
    );

    throw error;
  }
};

export default defineLogicFunction({
  universalIdentifier: EXPORT_CONTACTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'export-contacts',
  description:
    'Creates or updates the Google contacts matching the Twenty people the user selected.',
  timeoutSeconds: 300,
  handler,
  httpRouteTriggerSettings: {
    path: '/export-google-contacts',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
