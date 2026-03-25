import { type SettingsRolePermissionsSettingPermission } from '@/settings/roles/role-permissions/permission-flags/types/SettingsRolePermissionsSettingPermission';
import { type PermissionFlagType } from '~/generated-metadata/graphql';
import { WorkflowAiAgentPermissionsFlagRow } from './WorkflowAiAgentPermissionsFlagRow';
import { StyledLabel, StyledList } from './WorkflowAiAgentPermissionsStyles';

type WorkflowAiAgentPermissionsFlagListProps = {
  title: string;
  permissions: SettingsRolePermissionsSettingPermission[];
  enabledPermissionFlagKeys: PermissionFlagType[];
  readonly: boolean;
  showDeleteButton?: boolean;
  onAddPermissionFlag?: (permissionKey: PermissionFlagType) => void;
  onDeletePermissionFlag?: (permissionKey: PermissionFlagType) => void;
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
  const hasPermissions = permissions.length > 0;

  if (!hasPermissions) {
    return null;
  }

  return (
    <div>
      <StyledLabel>{title}</StyledLabel>
      <StyledList>
        {permissions.map((permission) => {
          const isEnabled = enabledPermissionFlagKeys.includes(permission.key);

          return (
            <WorkflowAiAgentPermissionsFlagRow
              key={permission.key}
              permission={permission}
              isEnabled={isEnabled}
              readonly={readonly}
              showDeleteButton={showDeleteButton}
              onAdd={
                isEnabled
                  ? undefined
                  : () => onAddPermissionFlag?.(permission.key)
              }
              onDelete={
                showDeleteButton
                  ? () => onDeletePermissionFlag?.(permission.key)
                  : undefined
              }
            />
          );
        })}
      </StyledList>
    </div>
  );
};
