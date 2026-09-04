import { type CoreApiClient } from 'twenty-client-sdk/core';

import { updateOpportunityApplicantPartnerUserIds } from 'src/modules/shared/graphql/mutations/update-opportunity-applicant-partner-user-ids';
import { getOpportunityApplicantPartnerUserIds } from 'src/modules/shared/graphql/queries/get-opportunity-applicant-partner-user-ids';
import { isNonEmptyString } from 'src/modules/shared/utils/is-non-empty-string.util';

const mergeApplicantPartnerUserIds = (
  current: readonly string[] | null | undefined,
  incoming: readonly string[],
): string[] => [...new Set([...(current ?? []), ...incoming])];

const GRANT_READ_ATTEMPTS = 3;

type GrantOpportunityVisibilityResult =
  | { granted: false; reason: 'missing_ids' | 'opportunity_missing' }
  | { granted: false; already: true }
  | { granted: true };

const readApplicantIds = async (
  client: CoreApiClient,
  opportunityId: string,
): Promise<string[] | null> => {
  const result = await getOpportunityApplicantPartnerUserIds(
    client,
    opportunityId,
  );
  const opportunity = result.opportunities?.edges?.[0]?.node;

  if (!opportunity?.id) {
    return null;
  }

  return opportunity.applicantPartnerUserIds ?? [];
};

export async function grantOpportunityVisibility(
  client: CoreApiClient,
  opportunityId: string | null | undefined,
  partnerUserIds: readonly string[],
): Promise<GrantOpportunityVisibilityResult> {
  const incoming = partnerUserIds.filter(isNonEmptyString);

  if (!isNonEmptyString(opportunityId) || incoming.length === 0) {
    return { granted: false, reason: 'missing_ids' };
  }

  // updateOpportunity replaces the array, so two applies can each merge from the same
  // stale read. Re-read after every write. Throw if the member id is still missing so the
  // create trigger retries and the upgrade backfill fails loud. The core API has no
  // atomic append; a lost id after this loop is a failed grant, not a silent success.
  let attempt = 0;

  while (true) {
    attempt += 1;
    const current = await readApplicantIds(client, opportunityId);

    if (current === null) {
      return { granted: false, reason: 'opportunity_missing' };
    }

    if (incoming.every((partnerUserId) => current.includes(partnerUserId))) {
      return attempt === 1
        ? { granted: false, already: true }
        : { granted: true };
    }

    if (attempt === GRANT_READ_ATTEMPTS) {
      const missingPartnerUserIds = incoming.filter(
        (partnerUserId) => !current.includes(partnerUserId),
      );

      throw new Error(
        `Could not grant opportunity visibility for ${opportunityId}: ` +
          `applicantPartnerUserIds still missing ${missingPartnerUserIds.join(', ')} ` +
          `after concurrent writes.`,
      );
    }

    await updateOpportunityApplicantPartnerUserIds(
      client,
      opportunityId,
      mergeApplicantPartnerUserIds(current, incoming),
    );
  }
}
