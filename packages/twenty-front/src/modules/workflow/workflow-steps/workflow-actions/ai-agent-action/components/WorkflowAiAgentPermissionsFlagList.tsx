import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { type SettingsRolePermissionsSettingPermission } from '@/settings/roles/role-permissions/permission-flags/types/SettingsRolePermissionsSettingPermission';
import { type PermissionFlagType } from '~/generated-metadata/graphql';
import { WorkflowAiAgentPermissionsFlagRow } from './WorkflowAiAgentPermissionsFlagRow';

type WorkflowAiAgentPermissionsFlagListProps = {
  title: string;
  permissions: SettingsRolePermissionsSettingPermission[];
  enabledPermissionFlagGrantKeys: PermissionFlagType[];
  readonly: boolean;
  showDeleteButton?: boolean;
  onAddPermissionFlagGrant?: (permissionKey: PermissionFlagType) => void;
  onDeletePermissionFlagGrant?: (permissionKey: PermissionFlagType) => void;
};

export const WorkflowAiAgentPermissionsFlagList = ({
  title,
  permissions,
  enabledPermissionFlagGrantKeys,
  readonly,
  showDeleteButton = false,
  onAddPermissionFlagGrant,
  onDeletePermissionFlagGrant,
}: WorkflowAiAgentPermissionsFlagListProps) => {
  if (permissions.length === 0) {
    return null;
  }

  return (
    <SidePanelGroup heading={title}>
      {permissions.map((permission) => {
        const isEnabled = enabledPermissionFlagGrantKeys.includes(
          permission.key,
        );

        return (
          <WorkflowAiAgentPermissionsFlagRow
            key={permission.key}
            permission={permission}
            isEnabled={isEnabled}
            readonly={readonly}
            showDeleteButton={showDeleteButton}
            onAdd={() => onAddPermissionFlagGrant?.(permission.key)}
            onDelete={() => onDeletePermissionFlagGrant?.(permission.key)}
          />
        );
      })}
    </SidePanelGroup>
  );
};
