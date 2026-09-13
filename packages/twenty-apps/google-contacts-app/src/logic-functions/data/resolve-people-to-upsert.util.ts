import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type ExistingTwentyPeople } from 'src/logic-functions/data/fetch-people-for-sync.util';
import {
  type PersonToUpsert,
  type TwentyPersonInput,
} from 'src/logic-functions/types/twenty-person.type';

export type SyncCandidate = {
  personInput: TwentyPersonInput;
  googleUpdatedAt: string | undefined;
};

// Google wins only when its copy is the newer one. Without this the cron would
// revert any edit made in Twenty between two syncs. An unparseable or missing
// timestamp on either side falls back to letting Google win.
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
}): PersonToUpsert[] => {
  const peopleToUpsert: PersonToUpsert[] = [];

  for (const { personInput, googleUpdatedAt } of candidates) {
    const linkedPerson = existingPeople.byGoogleContactsId.get(
      personInput.googleContactsId,
    );

    if (isDefined(linkedPerson)) {
      if (!hasTwentyChangedSince(linkedPerson.updatedAt, googleUpdatedAt)) {
        peopleToUpsert.push(personInput);
      }

      continue;
    }

    const primaryEmail = personInput.emails?.primaryEmail;
    const personWithSameEmail = isNonEmptyString(primaryEmail)
      ? existingPeople.byPrimaryEmail.get(primaryEmail.toLowerCase())
      : undefined;

    // An unlinked person reachable at the same address is the same human, so
    // they are adopted rather than duplicated. Someone already linked to a
    // different Google contact is left alone.
    if (
      isDefined(personWithSameEmail) &&
      !isNonEmptyString(personWithSameEmail.googleContactsId)
    ) {
      peopleToUpsert.push({ ...personInput, id: personWithSameEmail.id });

      continue;
    }

    peopleToUpsert.push(personInput);
  }

  return peopleToUpsert;
};
