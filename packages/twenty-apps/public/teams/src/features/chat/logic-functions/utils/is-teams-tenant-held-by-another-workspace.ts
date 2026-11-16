import { isNonEmptyString } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';

import { buildTeamsTenantKvKey } from 'src/features/chat/logic-functions/utils/build-teams-tenant-kv-key';

export const isTeamsTenantHeldByAnotherWorkspace = async ({
  tenantId,
  workspaceId,
}: {
  tenantId: string;
  workspaceId: string;
}): Promise<boolean> => {
  const claimingWorkspaceId = await kv.get<string>(
    buildTeamsTenantKvKey(tenantId),
    { scope: 'SERVER' },
  );

  return (
    isNonEmptyString(claimingWorkspaceId) && claimingWorkspaceId !== workspaceId
  );
};
