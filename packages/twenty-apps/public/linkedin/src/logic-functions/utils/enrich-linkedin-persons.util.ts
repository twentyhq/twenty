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
  city?: string | null;
  emails?: { primaryEmail?: string | null } | null;
  xLink?: { primaryLinkUrl?: string | null } | null;
};

const getLinkedinEnrichedPersonKey = (personId: string) =>
  `linkedin-enriched-person:${personId}`;

const findEnrichablePersons = async (
  personIds: string[],
): Promise<Map<string, EnrichablePersonRecord>> => {
  const { people } = await new CoreApiClient({ runAs: 'application' }).query({
    people: {
      __args: { filter: { id: { in: personIds } }, first: personIds.length },
      edges: {
        node: {
          id: true,
          jobTitle: true,
          city: true,
          emails: { primaryEmail: true },
          xLink: { primaryLinkUrl: true },
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

const updatePerson = async (
  personId: string,
  data: Record<string, unknown>,
): Promise<void> => {
  await new CoreApiClient({ runAs: 'application' }).mutation({
    updatePeople: {
      __args: { filter: { id: { eq: personId } }, data },
      id: true,
    },
  });
};

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

  const enrichment = buildLinkedinPersonEnrichment(
    await getUnipileUserProfile({
      accountId: unipileAccountId,
      userId: counterpart.id,
      deadlineAtMs,
    }),
  );

  const data = {
    ...(isDefined(enrichment.jobTitle) && !isNonEmptyString(person.jobTitle)
      ? { jobTitle: enrichment.jobTitle }
      : {}),
    ...(isDefined(enrichment.city) && !isNonEmptyString(person.city)
      ? { city: enrichment.city }
      : {}),
    ...(isDefined(enrichment.xLinkUrl) &&
    !isNonEmptyString(person.xLink?.primaryLinkUrl)
      ? { xLink: { primaryLinkUrl: enrichment.xLinkUrl } }
      : {}),
  };

  if (Object.keys(data).length > 0) {
    await updatePerson(person.id, data);
  }

  // Emails are unique on People: a taken one must not block the other fields
  if (
    isDefined(enrichment.email) &&
    !isNonEmptyString(person.emails?.primaryEmail)
  ) {
    try {
      await updatePerson(person.id, {
        emails: { primaryEmail: enrichment.email },
      });
    } catch (error) {
      console.warn(
        `[linkedin] could not set the email of person ${person.id}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  await kv.set(getLinkedinEnrichedPersonKey(person.id), true);

  console.log(`[linkedin] enriched person ${person.id} from LinkedIn`);
};

// Fills only empty fields, once per person, and never fails the sync it runs in
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

    const personById = await findEnrichablePersons([
      ...counterpartByPersonId.keys(),
    ]);

    for (const [personId, counterpart] of counterpartByPersonId) {
      const person = personById.get(personId);

      if (!isDefined(person)) {
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
