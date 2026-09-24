import { PermissionIcon } from '@/settings/roles/role-permissions/objects-permissions/components/PermissionIcon';
import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { t } from '@lingui/core/macro';
import { LightIconButton, MenuItem } from 'twenty-ui/components';
import { IconTrash } from 'twenty-ui/icon';

type WorkflowAiAgentPermissionsPermissionRowProps = {
  permission: {
    key: SettingsRoleObjectPermissionKey;
    label: string;
  };
  isEnabled: boolean;
  readonly: boolean;
  showDeleteButton?: boolean;
  alwaysShowGranted?: boolean;
  onAdd?: () => void;
  onDelete?: () => void;
};

export const WorkflowAiAgentPermissionsPermissionRow = ({
  permission,
  isEnabled,
  readonly,
  showDeleteButton = true,
  alwaysShowGranted = false,
  onAdd,
  onDelete,
}: WorkflowAiAgentPermissionsPermissionRowProps) => {
  const isClickable = !readonly && !isEnabled;
  const isDisabled = isEnabled && !showDeleteButton;
  const showTrashButton = isEnabled && showDeleteButton;

  return (
    <MenuItem
      LeftComponent={
        <PermissionIcon
          permission={permission.key}
          state={alwaysShowGranted || isEnabled ? 'granted' : 'revoked'}
        />
      }
      text={permission.label}
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
