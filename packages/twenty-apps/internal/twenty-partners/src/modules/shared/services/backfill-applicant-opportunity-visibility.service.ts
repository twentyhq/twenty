import { type CoreApiClient } from 'twenty-client-sdk/core';

import { listApplicationsWithOpportunityPartnerUser } from 'src/modules/shared/graphql/queries/list-applications-with-opportunity-partner-user';
import { grantOpportunityVisibility } from 'src/modules/shared/services/grant-opportunity-visibility.service';
import { isNonEmptyString } from 'src/modules/shared/utils/is-non-empty-string.util';
import { collectAll } from 'src/modules/shared/utils/paginate.util';

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

    if (!current.includes(partnerUserId)) {
      current.push(partnerUserId);
      idsByOpportunity.set(opportunityId, current);
    }
  }

  let updated = 0;
  const failedOpportunityIds: string[] = [];

  for (const [opportunityId, applicantIds] of idsByOpportunity) {
    // Collect failures rather than aborting on the first, so one bad opportunity cannot
    // strand the rest — then throw below. The version gate runs this once per upgrade, so
    // reporting a partial run as success would leave those applicants locked out for good.
    try {
      const result = await grantOpportunityVisibility(
        client,
        opportunityId,
        applicantIds,
      );

      if (result.granted) {
        updated += 1;
      }
    } catch (error) {
      failedOpportunityIds.push(opportunityId);
      console.error(
        `[backfill] applicant visibility failed for opportunity ${opportunityId}`,
        error,
      );
    }
  }

  if (failedOpportunityIds.length > 0) {
    throw new Error(
      `Applicant visibility backfill failed for ${failedOpportunityIds.length} of ` +
        `${idsByOpportunity.size} opportunities (${failedOpportunityIds.join(', ')}). ` +
        'Re-run the upgrade — granting is idempotent, so the ones already done are skipped.',
    );
  }

  return updated;
}
