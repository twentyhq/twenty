import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { type SettingsRolePermissionsSettingPermission } from '@/settings/roles/role-permissions/permission-flags/types/SettingsRolePermissionsSettingPermission';
import { WorkflowAiAgentPermissionsFlagRow } from './WorkflowAiAgentPermissionsFlagRow';

type WorkflowAiAgentPermissionsFlagListProps = {
  title: string;
  permissions: SettingsRolePermissionsSettingPermission[];
  enabledPermissionFlagKeys: string[];
  readonly: boolean;
  showDeleteButton?: boolean;
  onAddPermissionFlag?: (permissionKey: string) => void;
  onDeletePermissionFlag?: (permissionKey: string) => void;
};

export const WorkflowAiAgentPermissionsFlagList = ({
  title,
  permissions,
  enabledPermissionFlagKeys,
  readonly,
  showDeleteButton = false,
  onAddPermissionFlag,
  onDeletePermissionFlag,
}: WorkflowAiAgentPermissionsFlagListProps) => {
  if (permissions.length === 0) {
    return null;
  }

  return (
    <SidePanelGroup heading={title}>
      {permissions.map((permission) => {
        const isEnabled = enabledPermissionFlagKeys.includes(permission.key);

        return (
          <WorkflowAiAgentPermissionsFlagRow
            key={permission.key}
            permission={permission}
            isEnabled={isEnabled}
            readonly={readonly}
            showDeleteButton={showDeleteButton}
            onAdd={() => onAddPermissionFlag?.(permission.key)}
            onDelete={() => onDeletePermissionFlag?.(permission.key)}
          />
        );
      })}
    </SidePanelGroup>
  );
};
