import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { type AiRunScope } from 'twenty-shared/ai';

import { WORKFLOW_AI_AGENT_ALL_OBJECTS_PERMISSION_KEYS } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/constants/WorkflowAiAgentAllObjectsPermissionKeys';

type AiRunScopeObjectPermission = NonNullable<
  AiRunScope['objectPermissions']
>[number];

export const getWorkflowAiAgentEffectiveObjectPermission = ({
  scope,
  objectPermission,
  permissionKey,
}: {
  scope: AiRunScope | undefined;
  objectPermission: AiRunScopeObjectPermission | undefined;
  permissionKey: SettingsRoleObjectPermissionKey;
}): boolean =>
  objectPermission?.[permissionKey] ??
  scope?.[WORKFLOW_AI_AGENT_ALL_OBJECTS_PERMISSION_KEYS[permissionKey]] ??
  false;
