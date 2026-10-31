import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { WorkflowAiAgentPermissionsTab } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/WorkflowAiAgentPermissionsTab';
import { useWorkflowAiAgentScopePermissionActions } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/hooks/useWorkflowAiAgentScopePermissionActions';
import { getWorkflowAiAgentScopePermissions } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/getWorkflowAiAgentScopePermissions';
import { type AiRunScope } from 'twenty-shared/ai';

type WorkflowAiAgentScopePermissionsTabProps = {
  scope: AiRunScope | undefined;
  readonly: boolean;
  onScopeChange: (scope: AiRunScope) => void;
};

export const WorkflowAiAgentScopePermissionsTab = ({
  scope,
  readonly,
  onScopeChange,
}: WorkflowAiAgentScopePermissionsTabProps) => {
  const { objectMetadataItems } = useFilteredObjectMetadataItems();
  const { objectPermissions, permissionFlagKeys } =
    getWorkflowAiAgentScopePermissions({ scope, objectMetadataItems });
  const {
    onAddPermission,
    onDeletePermission,
    onAddPermissionFlag,
    onDeletePermissionFlag,
  } = useWorkflowAiAgentScopePermissionActions({
    scope,
    permissionFlagKeys,
    onScopeChange,
  });

  return (
    <WorkflowAiAgentPermissionsTab
      readonly={readonly}
      objectPermissions={objectPermissions}
      permissionFlagKeys={permissionFlagKeys}
      onAddPermission={onAddPermission}
      onDeletePermission={onDeletePermission}
      onAddPermissionFlag={onAddPermissionFlag}
      onDeletePermissionFlag={onDeletePermissionFlag}
    />
  );
};
