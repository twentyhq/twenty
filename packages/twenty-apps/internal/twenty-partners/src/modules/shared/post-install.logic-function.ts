import { CoreApiClient } from 'twenty-client-sdk/core';
import { type InstallPayload, definePostInstallLogicFunction } from 'twenty-sdk/define';

import { backfillPartnerUserOnChildren } from 'src/modules/shared/services/backfill-partner-user-on-children.service';

// The release that narrowed the Application RLS predicate to `partnerUser IS me`.
const STRICT_APPLICATION_RLS_VERSION = [1, 6, 1];

const isBefore = (version: string, target: number[]): boolean => {
  const parts = version.split('.').map((part) => Number.parseInt(part, 10) || 0);

  for (let index = 0; index < target.length; index++) {
    const part = parts[index] ?? 0;
    if (part !== target[index]) return part < target[index];
  }

  return false;
};

const handler = async ({ previousVersion }: InstallPayload) => {
  if (previousVersion && !isBefore(previousVersion, STRICT_APPLICATION_RLS_VERSION)) {
    return { skipped: true };
  }

  const stamped = await backfillPartnerUserOnChildren(new CoreApiClient());

  return { stamped };
};

export default definePostInstallLogicFunction({
  universalIdentifier: 'f92bad2e-5905-4757-96ee-af9869d4ca0c',
  name: 'post-install',
  description:
    'Stamps partnerUser on partner-owned records created before the Application RLS narrowing.',
  handler,
  shouldRunOnVersionUpgrade: true,
  shouldRunSynchronously: true,
});
