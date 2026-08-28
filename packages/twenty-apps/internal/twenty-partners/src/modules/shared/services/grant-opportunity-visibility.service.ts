import { type CoreApiClient } from 'twenty-client-sdk/core';

import { updateOpportunityApplicantPartnerUserIds } from 'src/modules/shared/graphql/mutations/update-opportunity-applicant-partner-user-ids';
import { getOpportunityApplicantPartnerUserIds } from 'src/modules/shared/graphql/queries/get-opportunity-applicant-partner-user-ids';
import { isNonEmptyString } from 'src/modules/shared/utils/is-non-empty-string.util';

export const mergeApplicantPartnerUserIds = (
  current: readonly string[] | null | undefined,
  incoming: readonly string[],
): string[] => {
  const merged = new Set(current ?? []);

  for (const id of incoming) {
    if (isNonEmptyString(id)) {
      merged.add(id);
    }
  }

  return [...merged];
};

export async function grantOpportunityVisibility(
  client: CoreApiClient,
  opportunityId: string,
  partnerUserId: string,
): Promise<Record<string, unknown>> {
  if (!isNonEmptyString(opportunityId) || !isNonEmptyString(partnerUserId)) {
    return { granted: false, reason: 'missing_ids' };
  }

  const result = await getOpportunityApplicantPartnerUserIds(
    client,
    opportunityId,
  );
  const opportunity = result.opportunities?.edges?.[0]?.node;

  if (!opportunity?.id) {
    return { granted: false, reason: 'opportunity_missing' };
  }

  const current = opportunity.applicantPartnerUserIds ?? [];

  if (current.includes(partnerUserId)) {
    return { granted: false, already: true };
  }

  await updateOpportunityApplicantPartnerUserIds(
    client,
    opportunityId,
    mergeApplicantPartnerUserIds(current, [partnerUserId]),
  );

  return { granted: true };
}
