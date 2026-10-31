import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { workflowAiAgentPermissionsIsAddingPermissionState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsIsAddingPermissionState';
import { workflowAiAgentPermissionsIsSystemObjectsListOpenState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsIsSystemObjectsListOpenState';
import { workflowAiAgentPermissionsSelectedObjectIdState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsSelectedObjectIdState';
import { type WorkflowAiAgentObjectPermissionChange } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/types/WorkflowAiAgentObjectPermissionChange';
import { grantWorkflowAiAgentObjectPermissionInScope } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/grantWorkflowAiAgentObjectPermissionInScope';
import { revokeWorkflowAiAgentObjectPermissionInScope } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/revokeWorkflowAiAgentObjectPermissionInScope';
import { revokeWorkflowAiAgentAllObjectsPermissionInScope } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/revokeWorkflowAiAgentAllObjectsPermissionInScope';
import { setWorkflowAiAgentPermissionFlagKeysInScope } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/setWorkflowAiAgentPermissionFlagKeysInScope';
import { type AiRunScope } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

type UseWorkflowAiAgentScopePermissionActionsParams = {
  scope: AiRunScope | undefined;
  readonly: boolean;
  permissionFlagKeys: string[];
  onScopeChange: (scope: AiRunScope) => void;
};

export const useWorkflowAiAgentScopePermissionActions = ({
  scope,
  readonly,
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

  const findObjectUniversalIdentifier = (objectMetadataId: string) =>
    objectMetadataItems.find((item) => item.id === objectMetadataId)
      ?.universalIdentifier;

  const updateObjectPermissionInScope = ({
    objectMetadataId,
    permissionKey,
    update,
  }: WorkflowAiAgentObjectPermissionChange & {
    update: typeof grantWorkflowAiAgentObjectPermissionInScope;
  }): boolean => {
    const objectUniversalIdentifier =
      findObjectUniversalIdentifier(objectMetadataId);

    if (readonly || !isDefined(objectUniversalIdentifier)) {
      return false;
    }

    onScopeChange(update({ scope, objectUniversalIdentifier, permissionKey }));

    return true;
  };

  const handleAddPermission = (
    change: WorkflowAiAgentObjectPermissionChange,
  ) => {
    if (
      updateObjectPermissionInScope({
        ...change,
        update: grantWorkflowAiAgentObjectPermissionInScope,
      })
    ) {
      closeAddPermission();
    }
  };

  const handleDeletePermission = (
    change: WorkflowAiAgentObjectPermissionChange,
  ) => {
    updateObjectPermissionInScope({
      ...change,
      update: revokeWorkflowAiAgentObjectPermissionInScope,
    });
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

  const handleDeleteAllObjectsPermission = (
    permissionKey: SettingsRoleObjectPermissionKey,
  ) => {
    if (readonly) {
      return;
    }

    onScopeChange(
      revokeWorkflowAiAgentAllObjectsPermissionInScope({
        scope,
        permissionKey,
      }),
    );
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
    handleDeleteAllObjectsPermission,
  };
};
