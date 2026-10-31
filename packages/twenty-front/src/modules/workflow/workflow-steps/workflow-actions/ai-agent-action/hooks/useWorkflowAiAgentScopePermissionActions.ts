import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { workflowAiAgentPermissionsIsAddingPermissionState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsIsAddingPermissionState';
import { workflowAiAgentPermissionsIsSystemObjectsListOpenState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsIsSystemObjectsListOpenState';
import { workflowAiAgentPermissionsSelectedObjectIdState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsSelectedObjectIdState';
import { type WorkflowAiAgentCrudObjectPermission } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/types/WorkflowAiAgentCrudObjectPermission';
import { grantWorkflowAiAgentObjectPermission } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/grantWorkflowAiAgentObjectPermission';
import { revokeWorkflowAiAgentObjectPermission } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/revokeWorkflowAiAgentObjectPermission';
import { setWorkflowAiAgentObjectPermissionInScope } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/setWorkflowAiAgentObjectPermissionInScope';
import { setWorkflowAiAgentPermissionFlagKeysInScope } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/setWorkflowAiAgentPermissionFlagKeysInScope';
import { type AiRunScope } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

type UseWorkflowAiAgentScopePermissionActionsParams = {
  scope: AiRunScope | undefined;
  readonly: boolean;
  objectPermissions: WorkflowAiAgentCrudObjectPermission[];
  permissionFlagKeys: string[];
  onScopeChange: (scope: AiRunScope) => void;
};

// The permissions of a step that runs no agent live in the step's own scope
export const useWorkflowAiAgentScopePermissionActions = ({
  scope,
  readonly,
  objectPermissions,
  permissionFlagKeys,
  onScopeChange,
}: UseWorkflowAiAgentScopePermissionActionsParams) => {
  const { objectMetadataItems } = useFilteredObjectMetadataItems();
  const setWorkflowAiAgentPermissionsSelectedObjectId = useSetAtomState(
    workflowAiAgentPermissionsSelectedObjectIdState,
  );
  const setWorkflowAiAgentPermissionsIsAddingPermission = useSetAtomState(
    workflowAiAgentPermissionsIsAddingPermissionState,
  );
  const setWorkflowAiAgentPermissionsIsSystemObjectsListOpen = useSetAtomState(
    workflowAiAgentPermissionsIsSystemObjectsListOpenState,
  );

  const closeAddPermission = () => {
    setWorkflowAiAgentPermissionsIsAddingPermission(false);
    setWorkflowAiAgentPermissionsSelectedObjectId(undefined);
    setWorkflowAiAgentPermissionsIsSystemObjectsListOpen(false);
  };

  const setObjectPermission = (
    objectPermission: WorkflowAiAgentCrudObjectPermission,
  ) => {
    const objectMetadataItem = objectMetadataItems.find(
      (item) => item.id === objectPermission.objectMetadataId,
    );

    if (!isDefined(objectMetadataItem)) {
      return;
    }

    onScopeChange(
      setWorkflowAiAgentObjectPermissionInScope({
        scope,
        objectUniversalIdentifier: objectMetadataItem.universalIdentifier,
        objectPermission,
      }),
    );
  };

  const findObjectPermission = (objectMetadataId: string) =>
    objectPermissions.find(
      (objectPermission) =>
        objectPermission.objectMetadataId === objectMetadataId,
    );

  const handleAddPermission = (
    objectMetadataId: string,
    permissionKey: SettingsRoleObjectPermissionKey,
  ) => {
    if (readonly) {
      return;
    }

    setObjectPermission(
      grantWorkflowAiAgentObjectPermission({
        objectMetadataId,
        objectPermission: findObjectPermission(objectMetadataId),
        permissionKey,
      }),
    );
    closeAddPermission();
  };

  const handleDeletePermission = (
    objectMetadataId: string,
    permissionKey: SettingsRoleObjectPermissionKey,
  ) => {
    const objectPermission = findObjectPermission(objectMetadataId);

    if (readonly || !isDefined(objectPermission)) {
      return;
    }

    setObjectPermission(
      revokeWorkflowAiAgentObjectPermission({
        objectMetadataId,
        objectPermission,
        permissionKey,
      }),
    );
  };

  const handleAddPermissionFlag = (permissionFlagKey: string) => {
    if (readonly || permissionFlagKeys.includes(permissionFlagKey)) {
      return;
    }

    onScopeChange(
      setWorkflowAiAgentPermissionFlagKeysInScope({
        scope,
        permissionFlagKeys: [...permissionFlagKeys, permissionFlagKey],
      }),
    );
    closeAddPermission();
  };

  const handleDeletePermissionFlag = (permissionFlagKey: string) => {
    if (readonly) {
      return;
    }

    onScopeChange(
      setWorkflowAiAgentPermissionFlagKeysInScope({
        scope,
        permissionFlagKeys: permissionFlagKeys.filter(
          (key) => key !== permissionFlagKey,
        ),
      }),
    );
  };

  return {
    handleAddPermission,
    handleDeletePermission,
    handleAddPermissionFlag,
    handleDeletePermissionFlag,
  };
};
