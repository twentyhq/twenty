import { isDefined } from 'twenty-shared/utils';
import { ListItemIcon } from '@/ui/navigation/list-item/components/ListItemIcon';
import { t } from '@lingui/core/macro';
import { LightIconButton } from 'twenty-ui/components';
import { type SettingsRolePermissionsSettingPermission } from '@/settings/roles/role-permissions/permission-flags/types/SettingsRolePermissionsSettingPermission';
import { IconTrash } from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';

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
  const isClickable = !readonly && !isEnabled && isDefined(onAdd);
  const isDisabled = isEnabled && !showDeleteButton;
  const showTrashButton = isEnabled && showDeleteButton;

  return (
    <ListItem
      onClick={
        isClickable
          ? (event) => {
              event.preventDefault();
              onAdd();
            }
          : undefined
      }
      disabled={isDisabled}
      actions={
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
      startIcon={<ListItemIcon icon={permission.Icon} container="soft" />}
    >
      {permission.name}
    </ListItem>
  );
};
