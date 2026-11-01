import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { workflowAiAgentPermissionsIsAddingPermissionState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsIsAddingPermissionState';
import { workflowAiAgentPermissionsIsSystemObjectsListOpenState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsIsSystemObjectsListOpenState';
import { workflowAiAgentPermissionsSelectedObjectIdState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsSelectedObjectIdState';
import { type WorkflowAiAgentObjectPermissionChange } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/types/WorkflowAiAgentObjectPermissionChange';
import { applyWorkflowAiAgentScopeObjectPermissionChange } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/applyWorkflowAiAgentScopeObjectPermissionChange';
import { applyWorkflowAiAgentScopePermissionFlagChange } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/applyWorkflowAiAgentScopePermissionFlagChange';
import { isUndefined } from '@sniptt/guards';
import { type AiRunScope } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

type UseWorkflowAiAgentScopePermissionActionsParams = {
  scope: AiRunScope | undefined;
  onScopeChange: (scope: AiRunScope) => void;
};

export const useWorkflowAiAgentScopePermissionActions = ({
  scope,
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

  const changeObjectPermission = (
    { objectMetadataId, permissionKey }: WorkflowAiAgentObjectPermissionChange,
    value: boolean,
  ) => {
    const objectUniversalIdentifier = isDefined(objectMetadataId)
      ? objectMetadataItems.find((item) => item.id === objectMetadataId)
          ?.universalIdentifier
      : null;

    if (isUndefined(objectUniversalIdentifier)) {
      return;
    }

    onScopeChange(
      applyWorkflowAiAgentScopeObjectPermissionChange({
        scope,
        objectUniversalIdentifier,
        permissionKey,
        value,
      }),
    );
  };

  const changePermissionFlag = (permissionFlagKey: string, value: boolean) =>
    onScopeChange(
      applyWorkflowAiAgentScopePermissionFlagChange({
        scope,
        permissionFlagKey,
        value,
      }),
    );

  return {
    onAddPermission: (change: WorkflowAiAgentObjectPermissionChange) => {
      changeObjectPermission(change, true);
      closeAddPermission();
    },
    onDeletePermission: (change: WorkflowAiAgentObjectPermissionChange) =>
      changeObjectPermission(change, false),
    onAddPermissionFlag: (permissionFlagKey: string) => {
      changePermissionFlag(permissionFlagKey, true);
      closeAddPermission();
    },
    onDeletePermissionFlag: (permissionFlagKey: string) =>
      changePermissionFlag(permissionFlagKey, false),
  };
};
