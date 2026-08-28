import { type CoreApiClient } from 'twenty-client-sdk/core';

import { updateOpportunityApplicantPartnerUserIds } from 'src/modules/shared/graphql/mutations/update-opportunity-applicant-partner-user-ids';
import { getOpportunityApplicantPartnerUserIds } from 'src/modules/shared/graphql/queries/get-opportunity-applicant-partner-user-ids';
import { isNonEmptyString } from 'src/modules/shared/utils/is-non-empty-string.util';

const mergeApplicantPartnerUserIds = (
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
  opportunityId: string,
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

  if (afterWrite === null || incoming.every((id) => afterWrite.includes(id))) {
    return { granted: true };
  }

  await updateOpportunityApplicantPartnerUserIds(
    client,
    opportunityId,
    mergeApplicantPartnerUserIds(afterWrite, incoming),
  );

  return { granted: true };
}
