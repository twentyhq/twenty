import { t } from '@lingui/core/macro';
import { LightIconButton } from 'twenty-ui/components';
import { type SettingsRolePermissionsSettingPermission } from '@/settings/roles/role-permissions/permission-flags/types/SettingsRolePermissionsSettingPermission';
import { MenuItem } from 'twenty-ui/components';
import { IconTrash } from 'twenty-ui/icon';

type WorkflowAiAgentPermissionsFlagRowProps = {
  permission: SettingsRolePermissionsSettingPermission;
  isEnabled: boolean;
  readonly: boolean;
  showDeleteButton?: boolean;
  onAdd?: () => void;
  onDelete?: () => void;
};

export const WorkflowAiAgentPermissionsFlagRow = ({
  permission,
  isEnabled,
  readonly,
  showDeleteButton = false,
  onAdd,
  onDelete,
}: WorkflowAiAgentPermissionsFlagRowProps) => {
  const isClickable = !readonly && !isEnabled && Boolean(onAdd);
  const isDisabled = isEnabled && !showDeleteButton;
  const showTrashButton = isEnabled && showDeleteButton;

  return (
    <MenuItem
      LeftIcon={permission.Icon}
      withIconContainer
      text={permission.name}
      onClick={isClickable ? onAdd : undefined}
      disabled={isDisabled}
      iconButtons={
        showTrashButton && (
          <LightIconButton
            aria-label={t`Remove permission`}
            onClick={(event) => {
              event.stopPropagation();
              onDelete?.();
            }}
          >
            <IconTrash />
          </LightIconButton>
        )
      }
    />
  );
};
