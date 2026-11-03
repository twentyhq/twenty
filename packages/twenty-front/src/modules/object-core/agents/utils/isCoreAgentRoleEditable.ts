import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { isDefined } from 'twenty-shared/utils';

export const isCoreAgentRoleEditable = ({
  role,
  agentId,
  workspaceCustomApplicationId,
}: {
  role: RoleWithPartialMembers | undefined;
  agentId: string;
  workspaceCustomApplicationId: string | undefined;
}) =>
  isDefined(role) &&
  role.isEditable &&
  role.applicationId === workspaceCustomApplicationId &&
  role.canBeAssignedToAgents &&
  !role.canBeAssignedToUsers &&
  !role.canBeAssignedToApiKeys &&
  role.workspaceMembers.length === 0 &&
  role.apiKeys.length === 0 &&
  role.agents.length === 1 &&
  role.agents[0].id === agentId;
