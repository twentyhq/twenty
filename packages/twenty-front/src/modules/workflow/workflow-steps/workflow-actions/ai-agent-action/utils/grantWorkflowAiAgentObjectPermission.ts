import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { type WorkflowAiAgentCrudObjectPermission } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/types/WorkflowAiAgentCrudObjectPermission';

// changing records needs reading them, so reading is granted along unless it was explicitly refused
export const grantWorkflowAiAgentObjectPermission = ({
  objectMetadataId,
  objectPermission,
  permissionKey,
}: {
  objectMetadataId: string;
  objectPermission:
    | Partial<Omit<WorkflowAiAgentCrudObjectPermission, 'objectMetadataId'>>
    | undefined;
  permissionKey: SettingsRoleObjectPermissionKey;
}): WorkflowAiAgentCrudObjectPermission => ({
  objectMetadataId,
  canReadObjectRecords:
    permissionKey === 'canReadObjectRecords' ||
    (objectPermission?.canReadObjectRecords ?? true),
  canUpdateObjectRecords:
    permissionKey === 'canUpdateObjectRecords' ||
    (objectPermission?.canUpdateObjectRecords ?? false),
  canSoftDeleteObjectRecords:
    permissionKey === 'canSoftDeleteObjectRecords' ||
    (objectPermission?.canSoftDeleteObjectRecords ?? false),
  canDestroyObjectRecords:
    permissionKey === 'canDestroyObjectRecords' ||
    (objectPermission?.canDestroyObjectRecords ?? false),
});
