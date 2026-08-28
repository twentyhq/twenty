import { type CoreApiClient } from 'twenty-client-sdk/core';

import { listApplicationsWithOpportunityPartnerUser } from 'src/modules/shared/graphql/queries/list-applications-with-opportunity-partner-user';
import { grantOpportunityVisibility } from 'src/modules/shared/services/grant-opportunity-visibility.service';
import { isNonEmptyString } from 'src/modules/shared/utils/is-non-empty-string.util';
import { collectAll } from 'src/modules/shared/utils/paginate.util';

type ApplicationRow = {
  opportunityId?: string | null;
  partnerUserId?: string | null;
};

export type ApplicantVisibilityBackfillResult = {
  updated: number;
  failed: number;
};

export async function backfillApplicantOpportunityVisibility(
  client: CoreApiClient,
): Promise<ApplicantVisibilityBackfillResult> {
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
  let failed = 0;

  for (const [opportunityId, applicantIds] of idsByOpportunity) {
    // The version gate runs this backfill once per upgrade, so one failing opportunity
    // must not abort the rest — they would never get a second pass.
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
      failed += 1;
      console.error(
        `[backfill] applicant visibility failed for opportunity ${opportunityId}`,
        error,
      );
    }
  }

  return { updated, failed };
}
