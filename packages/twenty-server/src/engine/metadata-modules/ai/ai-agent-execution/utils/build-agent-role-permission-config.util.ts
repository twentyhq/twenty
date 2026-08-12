import { isDefined } from 'twenty-shared/utils';

import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

// In run-as mode the member's own role is the whole boundary: the agent role
// is the application's default for runs with nobody behind them, not a
// per-user cap. App-level narrowing will come from install-time application
// grants at the platform layer, not from intersecting the agent role here.
export const buildAgentRolePermissionConfig = ({
  agentRoleId,
  runAsRoleId,
}: {
  agentRoleId: string;
  runAsRoleId?: string;
}): RolePermissionConfig => {
  if (isDefined(runAsRoleId)) {
    return { intersectionOf: [runAsRoleId] };
  }

  return { intersectionOf: [agentRoleId] };
};
