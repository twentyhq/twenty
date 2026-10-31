import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { type WorkflowAiAgentCrudObjectPermission } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/types/WorkflowAiAgentCrudObjectPermission';

// without reading records nothing else can be done with them, so revoking reading revokes everything
export const revokeWorkflowAiAgentObjectPermission = ({
  objectMetadataId,
  objectPermission,
  permissionKey,
}: {
  objectMetadataId: string;
  objectPermission: Partial<
    Omit<WorkflowAiAgentCrudObjectPermission, 'objectMetadataId'>
  >;
  permissionKey: SettingsRoleObjectPermissionKey;
}): WorkflowAiAgentCrudObjectPermission => {
  const isRevokingRead = permissionKey === 'canReadObjectRecords';

  return {
    objectMetadataId,
    canReadObjectRecords:
      !isRevokingRead && (objectPermission.canReadObjectRecords ?? false),
    canUpdateObjectRecords:
      !isRevokingRead &&
      permissionKey !== 'canUpdateObjectRecords' &&
      (objectPermission.canUpdateObjectRecords ?? false),
    canSoftDeleteObjectRecords:
      !isRevokingRead &&
      permissionKey !== 'canSoftDeleteObjectRecords' &&
      (objectPermission.canSoftDeleteObjectRecords ?? false),
    canDestroyObjectRecords:
      !isRevokingRead &&
      permissionKey !== 'canDestroyObjectRecords' &&
      (objectPermission.canDestroyObjectRecords ?? false),
  };
};
