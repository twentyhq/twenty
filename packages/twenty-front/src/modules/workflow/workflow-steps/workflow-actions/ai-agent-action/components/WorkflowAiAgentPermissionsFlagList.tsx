import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { type SettingsRolePermissionsSettingPermission } from '@/settings/roles/role-permissions/permission-flags/types/SettingsRolePermissionsSettingPermission';
import { WorkflowAiAgentPermissionsFlagRow } from './WorkflowAiAgentPermissionsFlagRow';

type WorkflowAiAgentPermissionsFlagListProps = {
  title: string;
  permissions: SettingsRolePermissionsSettingPermission[];
  enabledPermissionFlagKeys: string[];
  readonly: boolean;
  shouldShowDeleteButton?: boolean;
  onAddPermissionFlag?: (permissionKey: string) => void;
  onDeletePermissionFlag?: (permissionKey: string) => void;
};

export const WorkflowAiAgentPermissionsFlagList = ({
  title,
  permissions,
  enabledPermissionFlagKeys,
  readonly,
  shouldShowDeleteButton = false,
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
            shouldShowDeleteButton={shouldShowDeleteButton}
            onAdd={() => onAddPermissionFlag?.(permission.key)}
            onDelete={() => onDeletePermissionFlag?.(permission.key)}
          />
        );
      })}
    </SidePanelGroup>
  );
};
