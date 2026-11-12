import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { type WorkflowAiAgentObjectPermissionChange } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/types/WorkflowAiAgentObjectPermissionChange';
import { type WorkflowAiAgentObjectPermission } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/types/WorkflowAiAgentObjectPermission';
import { WorkflowAiAgentPermissionsPermissionRow } from './WorkflowAiAgentPermissionsPermissionRow';
import { useLingui } from '@lingui/react/macro';

type WorkflowAiAgentPermissionsCrudListProps = {
  permissions: Array<{
    key: SettingsRoleObjectPermissionKey;
    label: string;
  }>;
  objectPermissions?: WorkflowAiAgentObjectPermission;
  readonly: boolean;
  onAddPermission?: (change: WorkflowAiAgentObjectPermissionChange) => void;
  objectMetadataId: string;
};

export const WorkflowAiAgentPermissionsCrudList = ({
  permissions,
  objectPermissions,
  readonly,
  onAddPermission,
  objectMetadataId,
}: WorkflowAiAgentPermissionsCrudListProps) => {
  const { t } = useLingui();
  return (
    <SidePanelGroup heading={t`CRUD`}>
      {permissions.map((permission) => {
        const isEnabled = objectPermissions?.[permission.key] ?? false;

        return (
          <WorkflowAiAgentPermissionsPermissionRow
            key={permission.key}
            permission={permission}
            isEnabled={isEnabled}
            readonly={readonly}
            shouldShowDeleteButton={false}
            alwaysShowGranted={true}
            onAdd={() =>
              onAddPermission?.({
                objectMetadataId,
                permissionKey: permission.key,
              })
            }
          />
        );
      })}
    </SidePanelGroup>
  );
};
