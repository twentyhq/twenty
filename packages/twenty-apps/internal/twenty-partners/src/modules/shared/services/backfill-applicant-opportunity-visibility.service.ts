import { type CoreApiClient } from 'twenty-client-sdk/core';

import { updateOpportunityApplicantPartnerUserIds } from 'src/modules/shared/graphql/mutations/update-opportunity-applicant-partner-user-ids';
import { getOpportunityApplicantPartnerUserIds } from 'src/modules/shared/graphql/queries/get-opportunity-applicant-partner-user-ids';
import { listApplicationsWithOpportunityPartnerUser } from 'src/modules/shared/graphql/queries/list-applications-with-opportunity-partner-user';
import { mergeApplicantPartnerUserIds } from 'src/modules/shared/services/grant-opportunity-visibility.service';
import { collectAll } from 'src/modules/shared/utils/paginate.util';
import { isNonEmptyString } from 'src/modules/shared/utils/is-non-empty-string.util';

type ApplicationRow = {
  opportunityId?: string | null;
  partnerUserId?: string | null;
};

export async function backfillApplicantOpportunityVisibility(
  client: CoreApiClient,
): Promise<number> {
  const applications = await collectAll<ApplicationRow>(async (after) => {
    const page = await listApplicationsWithOpportunityPartnerUser(client, after);

    return page.applications;
  });

  const idsByOpportunity = new Map<string, string[]>();

  for (const application of applications) {
    const opportunityId = application.opportunityId;
    const partnerUserId = application.partnerUserId;

    if (!isNonEmptyString(opportunityId) || !isNonEmptyString(partnerUserId)) {
      continue;
    }

    const current = idsByOpportunity.get(opportunityId) ?? [];

    idsByOpportunity.set(
      opportunityId,
      mergeApplicantPartnerUserIds(current, [partnerUserId]),
    );
  }

  let updated = 0;

  for (const [opportunityId, applicantIds] of idsByOpportunity) {
    const result = await getOpportunityApplicantPartnerUserIds(
      client,
      opportunityId,
    );
    const opportunity = result.opportunities?.edges?.[0]?.node;

    if (!opportunity?.id) {
      continue;
    }

    const current = opportunity.applicantPartnerUserIds ?? [];
    const merged = mergeApplicantPartnerUserIds(current, applicantIds);

    if (
      merged.length === current.length &&
      merged.every((id) => current.includes(id))
    ) {
      continue;
    }

    await updateOpportunityApplicantPartnerUserIds(
      client,
      opportunityId,
      merged,
    );
    updated += 1;
  }

  return updated;
}
