import { CoreApiClient } from 'twenty-client-sdk/core';
import { type InstallPayload, definePostInstallLogicFunction } from 'twenty-sdk/define';

import { backfillApplicantOpportunityVisibility } from 'src/modules/shared/services/backfill-applicant-opportunity-visibility.service';
import { backfillPartnerUserOnChildren } from 'src/modules/shared/services/backfill-partner-user-on-children.service';

// The release that narrowed the Application RLS predicate to `partnerUser IS me`.
const STRICT_APPLICATION_RLS_VERSION = [1, 6, 1];
// The release that grants opportunity read access to applicants after unlist.
const APPLICANT_OPPORTUNITY_VISIBILITY_VERSION = [1, 8, 1];

const isBefore = (version: string, target: number[]): boolean => {
  const parts = version.split('.').map((part) => Number.parseInt(part, 10) || 0);

  for (let index = 0; index < target.length; index++) {
    const part = parts[index] ?? 0;
    if (part !== target[index]) return part < target[index];
  }

  return false;
};

const handler = async ({ previousVersion }: InstallPayload) => {
  const client = new CoreApiClient();
  const result: Record<string, unknown> = {};

  if (!previousVersion || isBefore(previousVersion, STRICT_APPLICATION_RLS_VERSION)) {
    result.stamped = await backfillPartnerUserOnChildren(client);
  }

  if (
    !previousVersion ||
    isBefore(previousVersion, APPLICANT_OPPORTUNITY_VISIBILITY_VERSION)
  ) {
    result.granted = await backfillApplicantOpportunityVisibility(client);
  }

  if (Object.keys(result).length === 0) {
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
