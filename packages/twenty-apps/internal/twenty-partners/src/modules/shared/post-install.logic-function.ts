import { CoreApiClient } from 'twenty-client-sdk/core';
import { type InstallPayload, definePostInstallLogicFunction } from 'twenty-sdk/define';

import { backfillApplicantOpportunityVisibility } from 'src/modules/shared/services/backfill-applicant-opportunity-visibility.service';
import { backfillPartnerUserOnChildren } from 'src/modules/shared/services/backfill-partner-user-on-children.service';
import { planPostInstall } from 'src/modules/shared/utils/plan-post-install.util';

type PostInstallCounts = {
  stamped?: number;
  granted?: number;
};

type PostInstallResult = { skipped: true } | PostInstallCounts;

const handler = async ({
  previousVersion,
}: InstallPayload): Promise<PostInstallResult> => {
  const plan = planPostInstall(previousVersion);

  if (!plan.stampPartnerUser && !plan.grantApplicantVisibility) {
    return { skipped: true };
  }

  const client = new CoreApiClient();
  const result: PostInstallCounts = {};

  // Grant reads partnerUserId on Application. Stamp first so an upgrade from
  // before 1.6.1 does not skip those applicants.
  if (plan.stampPartnerUser) {
    result.stamped = await backfillPartnerUserOnChildren(client);
  }

  if (plan.grantApplicantVisibility) {
    result.granted = await backfillApplicantOpportunityVisibility(client);
  }

  return result;
};

export default definePostInstallLogicFunction({
  universalIdentifier: 'f92bad2e-5905-4757-96ee-af9869d4ca0c',
  name: 'post-install',
  description:
    'Stamps partnerUser on partner-owned records created before the Application RLS narrowing, and grants opportunity read access to existing applicants.',
  handler,
  shouldRunOnVersionUpgrade: true,
  shouldRunSynchronously: true,
});
