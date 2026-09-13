import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type ExistingTwentyPeople } from 'src/logic-functions/data/fetch-people-for-sync.util';
import { type Organization } from 'src/logic-functions/types/google-response.type';
import {
  type PersonToUpsert,
  type TwentyPersonInput,
} from 'src/logic-functions/types/twenty-person.type';

export type SyncCandidate = {
  personInput: TwentyPersonInput;
  googleUpdatedAt: string | undefined;
  organization: Organization | undefined;
};

export type ResolvedPerson = {
  personInput: PersonToUpsert;
  organization: Organization | undefined;
};

const hasTwentyChangedSince = (
  twentyUpdatedAt: string | null | undefined,
  googleUpdatedAt: string | undefined,
): boolean => {
  if (
    !isNonEmptyString(twentyUpdatedAt) ||
    !isNonEmptyString(googleUpdatedAt)
  ) {
    return false;
  }

  const twentyTime = Date.parse(twentyUpdatedAt);
  const googleTime = Date.parse(googleUpdatedAt);

  return (
    Number.isFinite(twentyTime) &&
    Number.isFinite(googleTime) &&
    twentyTime > googleTime
  );
};

export const resolvePeopleToUpsert = ({
  candidates,
  existingPeople,
}: {
  candidates: SyncCandidate[];
  existingPeople: ExistingTwentyPeople;
}): ResolvedPerson[] => {
  const resolvedPeople: ResolvedPerson[] = [];
  const claimedPrimaryEmails = new Set<string>();

  for (const { personInput, googleUpdatedAt, organization } of candidates) {
    const primaryEmail = personInput.emails?.primaryEmail?.toLowerCase();

    if (isNonEmptyString(primaryEmail)) {
      if (claimedPrimaryEmails.has(primaryEmail)) {
        console.log(
          '[google-contacts] Skipping a contact sharing a primary email with another one',
          personInput.googleContactsId,
        );

        continue;
      }

      claimedPrimaryEmails.add(primaryEmail);
    }

    const linkedPerson = existingPeople.byGoogleContactsId.get(
      personInput.googleContactsId,
    );

    if (isDefined(linkedPerson)) {
      if (!hasTwentyChangedSince(linkedPerson.updatedAt, googleUpdatedAt)) {
        resolvedPeople.push({ personInput, organization });
      }

      continue;
    }

    const personWithSameEmail = isNonEmptyString(primaryEmail)
      ? existingPeople.byPrimaryEmail.get(primaryEmail)
      : undefined;

    // An unlinked person reachable at the same address is the same human, so
    // they are adopted rather than duplicated. Someone already linked to a
    // different Google contact is left alone.
    if (
      isDefined(personWithSameEmail) &&
      !isNonEmptyString(personWithSameEmail.googleContactsId)
    ) {
      if (
        !hasTwentyChangedSince(personWithSameEmail.updatedAt, googleUpdatedAt)
      ) {
        resolvedPeople.push({
          personInput: { ...personInput, id: personWithSameEmail.id },
          organization,
        });
      }

      continue;
    }

    resolvedPeople.push({ personInput, organization });
  }

  return resolvedPeople;
};
