import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { workflowAiAgentPermissionsIsAddingPermissionState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsIsAddingPermissionState';
import { workflowAiAgentPermissionsIsSystemObjectsListOpenState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsIsSystemObjectsListOpenState';
import { workflowAiAgentPermissionsSelectedObjectIdState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsSelectedObjectIdState';
import { type WorkflowAiAgentObjectPermissionChange } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/types/WorkflowAiAgentObjectPermissionChange';
import { applyWorkflowAiAgentScopeObjectPermissionChange } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/applyWorkflowAiAgentScopeObjectPermissionChange';
import { isUndefined } from '@sniptt/guards';
import { type AiRunScope } from 'twenty-shared/ai';
import { PERMISSION_FLAG_UNIVERSAL_IDENTIFIER_BY_TYPE } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

type UseWorkflowAiAgentScopePermissionActionsParams = {
  scope: AiRunScope | undefined;
  permissionFlagKeys: string[];
  onScopeChange: (scope: AiRunScope) => void;
};

export const useWorkflowAiAgentScopePermissionActions = ({
  scope,
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

  const setPermissionFlagKeys = (nextPermissionFlagKeys: string[]) =>
    onScopeChange({
      ...scope,
      permissionFlagUniversalIdentifiers: nextPermissionFlagKeys
        .map((permissionFlagKey) =>
          PERMISSION_FLAG_UNIVERSAL_IDENTIFIER_BY_TYPE.get(permissionFlagKey),
        )
        .filter(isDefined),
    });

  return {
    onAddPermission: (change: WorkflowAiAgentObjectPermissionChange) => {
      changeObjectPermission(change, true);
      closeAddPermission();
    },
    onDeletePermission: (change: WorkflowAiAgentObjectPermissionChange) =>
      changeObjectPermission(change, false),
    onAddPermissionFlag: (permissionFlagKey: string) => {
      setPermissionFlagKeys([...permissionFlagKeys, permissionFlagKey]);
      closeAddPermission();
    },
    onDeletePermissionFlag: (permissionFlagKey: string) =>
      setPermissionFlagKeys(
        permissionFlagKeys.filter((key) => key !== permissionFlagKey),
      ),
  };
};
