import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { LINKEDIN_ENRICHMENT_DAILY_PROFILE_LOOKUP_LIMIT } from 'src/constants/linkedin-enrichment-daily-profile-lookup-limit.constant';
import { buildLinkedinPersonEnrichment } from 'src/logic-functions/utils/build-linkedin-person-enrichment.util';
import { getLinkedinEnrichedPersonKey } from 'src/logic-functions/utils/get-linkedin-enriched-person-key.util';
import { consumeLinkedinProfileLookupOrThrow } from 'src/logic-functions/utils/consume-linkedin-profile-lookup-or-throw.util';
import { isTransientLinkedinError } from 'src/logic-functions/utils/is-transient-linkedin-error.util';
import { getUnipileUserProfile } from 'src/unipile/utils/get-unipile-user-profile.util';

type EnrichablePersonRecord = {
  id: string;
  jobTitle?: string | null;
  emails?: { primaryEmail?: string | null } | null;
  phones?: { primaryPhoneNumber?: string | null } | null;
};

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

const findEnrichablePerson = async ({
  personId,
  deadlineAtMs,
}: {
  personId: string;
  deadlineAtMs: number;
}): Promise<EnrichablePersonRecord | undefined> => {
  const { people } = await new CoreApiClient({
    runAs: 'application',
    fetch: createDeadlineBoundFetch(deadlineAtMs),
  }).query({
    people: {
      __args: { filter: { id: { eq: personId } }, first: 1 },
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

  return people?.edges?.map(
    (edge: { node: EnrichablePersonRecord }) => edge.node,
  )[0];
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
    // Rethrown so the job retries before the person is marked as enriched
    if (isTransientLinkedinError(error)) {
      throw error;
    }

    console.warn(
      `[linkedin] could not set the ${field} of person ${personId}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

const hasEmptyEnrichableField = (person: EnrichablePersonRecord): boolean =>
  !isNonEmptyString(person.jobTitle) ||
  !isNonEmptyString(person.emails?.primaryEmail) ||
  !isNonEmptyString(person.phones?.primaryPhoneNumber);

export const enrichLinkedinPerson = async ({
  unipileAccountId,
  personId,
  providerUserId,
  deadlineAtMs,
}: {
  unipileAccountId: string;
  personId: string;
  providerUserId: string;
  deadlineAtMs: number;
}): Promise<void> => {
  const enrichedPersonKey = getLinkedinEnrichedPersonKey(personId);

  if (await kv.get<boolean>(enrichedPersonKey)) {
    return;
  }

  const person = await findEnrichablePerson({ personId, deadlineAtMs });

  if (!isDefined(person)) {
    return;
  }

  if (!hasEmptyEnrichableField(person)) {
    await kv.set(enrichedPersonKey, true);

    return;
  }

  await consumeLinkedinProfileLookupOrThrow({
    unipileAccountId,
    dailyLimit: LINKEDIN_ENRICHMENT_DAILY_PROFILE_LOOKUP_LIMIT,
  });

  const { jobTitle, email, phoneNumber } = buildLinkedinPersonEnrichment(
    await getUnipileUserProfile({
      accountId: unipileAccountId,
      userId: providerUserId,
      deadlineAtMs,
    }),
  );

  if (isDefined(jobTitle) && !isNonEmptyString(person.jobTitle)) {
    await setEmptyPersonFieldOrWarn({
      personId,
      field: 'job title',
      emptyFieldFilter: EMPTY_JOB_TITLE_FILTER,
      data: { jobTitle },
      deadlineAtMs,
    });
  }

  if (isDefined(email) && !isNonEmptyString(person.emails?.primaryEmail)) {
    await setEmptyPersonFieldOrWarn({
      personId,
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
      personId,
      field: 'phone',
      emptyFieldFilter: EMPTY_PHONE_FILTER,
      data: { phones: { primaryPhoneNumber: phoneNumber } },
      deadlineAtMs,
    });
  }

  await kv.set(enrichedPersonKey, true);

  console.log(`[linkedin] enriched person ${personId} from LinkedIn`);
};
