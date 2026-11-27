import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { LINKEDIN_ENRICHMENT_DAILY_PROFILE_LOOKUP_LIMIT } from 'src/constants/linkedin-enrichment-daily-profile-lookup-limit.constant';
import { buildLinkedinPersonEnrichment } from 'src/logic-functions/utils/build-linkedin-person-enrichment.util';
import { buildLinkedinProfileHandle } from 'src/logic-functions/utils/build-linkedin-profile-handle.util';
import { consumeLinkedinProfileLookupOrThrow } from 'src/logic-functions/utils/consume-linkedin-profile-lookup-or-throw.util';
import { type UnipileUser } from 'src/unipile/types/unipile-user.type';
import { getUnipileUserProfile } from 'src/unipile/utils/get-unipile-user-profile.util';
import { UnipileRateLimitError } from 'src/unipile/utils/request-unipile.util';

type EnrichablePersonRecord = {
  id: string;
  jobTitle?: string | null;
  emails?: { primaryEmail?: string | null } | null;
  phones?: { primaryPhoneNumber?: string | null } | null;
};

const getLinkedinEnrichedPersonKey = (personId: string) =>
  `linkedin-enriched-person:${personId}`;

const EMPTY_JOB_TITLE_FILTER = {
  or: [{ jobTitle: { is: 'NULL' as const } }, { jobTitle: { eq: '' } }],
};

const EMPTY_EMAIL_FILTER = {
  or: [
    { emails: { primaryEmail: { is: 'NULL' as const } } },
    { emails: { primaryEmail: { eq: '' } } },
  ],
};

const EMPTY_PHONE_FILTER = {
  or: [
    { phones: { primaryPhoneNumber: { is: 'NULL' as const } } },
    { phones: { primaryPhoneNumber: { eq: '' } } },
  ],
};

const createDeadlineBoundFetch =
  (deadlineAtMs: number) =>
  (input: RequestInfo | URL, init?: RequestInit): Promise<Response> =>
    fetch(input, {
      ...init,
      signal: AbortSignal.timeout(Math.max(deadlineAtMs - Date.now(), 1)),
    });

const findEnrichablePersons = async ({
  personIds,
  deadlineAtMs,
}: {
  personIds: string[];
  deadlineAtMs: number;
}): Promise<Map<string, EnrichablePersonRecord>> => {
  const { people } = await new CoreApiClient({
    runAs: 'application',
    fetch: createDeadlineBoundFetch(deadlineAtMs),
  }).query({
    people: {
      __args: { filter: { id: { in: personIds } }, first: personIds.length },
      edges: {
        node: {
          id: true,
          jobTitle: true,
          emails: { primaryEmail: true },
          phones: { primaryPhoneNumber: true },
        },
      },
    },
  });

  return new Map(
    (people?.edges ?? []).map((edge: { node: EnrichablePersonRecord }) => [
      edge.node.id,
      edge.node,
    ]),
  );
};

// The empty filter keeps a value a member typed during the lookup.
// Emails are unique and phones validated, so each field is set alone.
const setEmptyPersonFieldOrWarn = async ({
  personId,
  field,
  emptyFieldFilter,
  data,
  deadlineAtMs,
}: {
  personId: string;
  field: string;
  emptyFieldFilter: Record<string, unknown>;
  data: Record<string, unknown>;
  deadlineAtMs: number;
}): Promise<void> => {
  try {
    await new CoreApiClient({
      runAs: 'application',
      fetch: createDeadlineBoundFetch(deadlineAtMs),
    }).mutation({
      updatePeople: {
        __args: {
          filter: { and: [{ id: { eq: personId } }, emptyFieldFilter] },
          data,
        },
        id: true,
      },
    });
  } catch (error) {
    console.warn(
      `[linkedin] could not set the ${field} of person ${personId}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

const hasEmptyEnrichableField = (person: EnrichablePersonRecord): boolean =>
  !isNonEmptyString(person.jobTitle) ||
  !isNonEmptyString(person.emails?.primaryEmail) ||
  !isNonEmptyString(person.phones?.primaryPhoneNumber);

const enrichPerson = async ({
  unipileAccountId,
  counterpart,
  person,
  deadlineAtMs,
}: {
  unipileAccountId: string;
  counterpart: UnipileUser;
  person: EnrichablePersonRecord;
  deadlineAtMs: number;
}): Promise<void> => {
  await consumeLinkedinProfileLookupOrThrow({
    unipileAccountId,
    dailyLimit: LINKEDIN_ENRICHMENT_DAILY_PROFILE_LOOKUP_LIMIT,
  });

  const { jobTitle, email, phoneNumber } = buildLinkedinPersonEnrichment(
    await getUnipileUserProfile({
      accountId: unipileAccountId,
      userId: counterpart.id,
      deadlineAtMs,
    }),
  );

  if (isDefined(jobTitle) && !isNonEmptyString(person.jobTitle)) {
    await setEmptyPersonFieldOrWarn({
      personId: person.id,
      field: 'job title',
      emptyFieldFilter: EMPTY_JOB_TITLE_FILTER,
      data: { jobTitle },
      deadlineAtMs,
    });
  }

  if (isDefined(email) && !isNonEmptyString(person.emails?.primaryEmail)) {
    await setEmptyPersonFieldOrWarn({
      personId: person.id,
      field: 'email',
      emptyFieldFilter: EMPTY_EMAIL_FILTER,
      data: { emails: { primaryEmail: email } },
      deadlineAtMs,
    });
  }

  if (
    isDefined(phoneNumber) &&
    !isNonEmptyString(person.phones?.primaryPhoneNumber)
  ) {
    await setEmptyPersonFieldOrWarn({
      personId: person.id,
      field: 'phone',
      emptyFieldFilter: EMPTY_PHONE_FILTER,
      data: { phones: { primaryPhoneNumber: phoneNumber } },
      deadlineAtMs,
    });
  }

  await kv.set(getLinkedinEnrichedPersonKey(person.id), true);

  console.log(`[linkedin] enriched person ${person.id} from LinkedIn`);
};

export const enrichLinkedinPersons = async ({
  unipileAccountId,
  counterparts,
  personIdByHandle,
  deadlineAtMs,
}: {
  unipileAccountId: string;
  counterparts: UnipileUser[];
  personIdByHandle: Map<string, string>;
  deadlineAtMs: number;
}): Promise<void> => {
  try {
    const counterpartByPersonId = new Map<string, UnipileUser>();

    for (const counterpart of counterparts) {
      const personId = personIdByHandle.get(
        buildLinkedinProfileHandle(counterpart),
      );

      if (
        isDefined(personId) &&
        !counterpartByPersonId.has(personId) &&
        !(await kv.get<boolean>(getLinkedinEnrichedPersonKey(personId)))
      ) {
        counterpartByPersonId.set(personId, counterpart);
      }
    }

    if (counterpartByPersonId.size === 0 || Date.now() >= deadlineAtMs) {
      return;
    }

    const personById = await findEnrichablePersons({
      personIds: [...counterpartByPersonId.keys()],
      deadlineAtMs,
    });

    for (const [personId, counterpart] of counterpartByPersonId) {
      const person = personById.get(personId);

      if (!isDefined(person) || !hasEmptyEnrichableField(person)) {
        continue;
      }

      if (Date.now() >= deadlineAtMs) {
        console.warn(
          '[linkedin] person enrichment reached the job deadline, remaining people skipped',
        );

        return;
      }

      try {
        await enrichPerson({
          unipileAccountId,
          counterpart,
          person,
          deadlineAtMs,
        });
      } catch (error) {
        if (error instanceof UnipileRateLimitError) {
          console.warn(`[linkedin] person enrichment paused: ${error.message}`);

          return;
        }

        console.warn(
          `[linkedin] could not enrich person ${personId}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  } catch (error) {
    console.warn(
      `[linkedin] could not enrich people: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};
