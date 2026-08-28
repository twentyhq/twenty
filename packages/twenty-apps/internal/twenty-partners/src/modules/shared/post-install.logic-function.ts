import { CoreApiClient } from 'twenty-client-sdk/core';
import { type InstallPayload, definePostInstallLogicFunction } from 'twenty-sdk/define';

import { backfillApplicantOpportunityVisibility } from 'src/modules/shared/services/backfill-applicant-opportunity-visibility.service';
import { backfillPartnerUserOnChildren } from 'src/modules/shared/services/backfill-partner-user-on-children.service';
import { planPostInstall } from 'src/modules/shared/utils/plan-post-install.util';

type PostInstallResult =
  | { skipped: true }
  | { stamped?: number; granted?: number };

const handler = async ({
  previousVersion,
}: InstallPayload): Promise<PostInstallResult> => {
  const client = new CoreApiClient();
  const plan = planPostInstall(previousVersion);
  const result: { stamped?: number; granted?: number } = {};

  if (plan.stampPartnerUser) {
    result.stamped = await backfillPartnerUserOnChildren(client);
  }

  if (plan.grantApplicantVisibility) {
    result.granted = await backfillApplicantOpportunityVisibility(client);
  }

  if (result.stamped === undefined && result.granted === undefined) {
    return { skipped: true };
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
