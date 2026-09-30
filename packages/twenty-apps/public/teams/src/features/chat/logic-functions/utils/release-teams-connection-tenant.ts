import { isNonEmptyString } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';

import { buildTeamsConnectedAccountTenantKvKey } from 'src/features/chat/logic-functions/utils/build-teams-connected-account-tenant-kv-key';
import { buildTeamsTenantKvKey } from 'src/features/chat/logic-functions/utils/build-teams-tenant-kv-key';
import { isTeamsTenantClaimedByAnotherConnection } from 'src/features/chat/logic-functions/utils/is-teams-tenant-claimed-by-another-connection';

export const releaseTeamsConnectionTenant = async ({
  connectedAccountId,
}: {
  connectedAccountId: string;
}): Promise<{ releasedTenantId: string | null }> => {
  if (!isNonEmptyString(connectedAccountId)) {
    throw new Error('Teams tenant release failed: missing connectedAccountId');
  }

  const connectedAccountTenantKvKey =
    buildTeamsConnectedAccountTenantKvKey(connectedAccountId);
  const tenantId = await kv.get<string>(connectedAccountTenantKvKey);

  const shouldReleaseTenant =
    isNonEmptyString(tenantId) &&
    !(await isTeamsTenantClaimedByAnotherConnection({
      tenantId,
      excludedConnectedAccountId: connectedAccountId,
    }));

  const hasReleasedTenant = shouldReleaseTenant
    ? await kv.delete(buildTeamsTenantKvKey(tenantId), { scope: 'SERVER' })
    : false;

  await kv.delete(connectedAccountTenantKvKey);

  return { releasedTenantId: hasReleasedTenant ? tenantId : null };
};
