import { type CoreApiClient } from 'twenty-client-sdk/core';

import { updateOpportunityApplicantPartnerUserIds } from 'src/modules/shared/graphql/mutations/update-opportunity-applicant-partner-user-ids';
import { getOpportunityApplicantPartnerUserIds } from 'src/modules/shared/graphql/queries/get-opportunity-applicant-partner-user-ids';
import { isNonEmptyString } from 'src/modules/shared/utils/is-non-empty-string.util';

// Callers pass ids already filtered by isNonEmptyString.
const mergeApplicantPartnerUserIds = (
  current: readonly string[] | null | undefined,
  incoming: readonly string[],
): string[] => [...new Set([...(current ?? []), ...incoming])];

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

  const current = await readApplicantIds(client, opportunityId);

  if (current === null) {
    return { granted: false, reason: 'opportunity_missing' };
  }

  if (incoming.every((id) => current.includes(id))) {
    return { granted: false, already: true };
  }

  await updateOpportunityApplicantPartnerUserIds(
    client,
    opportunityId,
    mergeApplicantPartnerUserIds(current, incoming),
  );

  const afterWrite = await readApplicantIds(client, opportunityId);

  if (afterWrite === null) {
    return { granted: false, reason: 'opportunity_missing' };
  }

  if (incoming.every((id) => afterWrite.includes(id))) {
    return { granted: true };
  }

  await updateOpportunityApplicantPartnerUserIds(
    client,
    opportunityId,
    mergeApplicantPartnerUserIds(afterWrite, incoming),
  );

  return { granted: true };
}
