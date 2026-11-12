import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';

export const buildCoreAgentNewRole = ({
  roleId,
  agent,
  label,
  description,
}: {
  roleId: string;
  agent: CoreAgent;
  label: string;
  description: string;
}): RoleWithPartialMembers => ({
  id: roleId,
  label,
  description,
  icon: 'IconLock',
  canUpdateAllSettings: false,
  canAccessAllTools: false,
  canAccessAllAgentChatChannels: false,
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canBeAssignedToUsers: false,
  canBeAssignedToAgents: true,
  canBeAssignedToApiKeys: false,
  applicationId: '',
  isEditable: true,
  workspaceMembers: [],
  apiKeys: [],
  agents: [agent],
});
