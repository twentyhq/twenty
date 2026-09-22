import { isDefined } from 'twenty-shared/utils';
import { t } from '@lingui/core/macro';
import { LightIconButton } from 'twenty-ui/components';
import { PermissionIcon } from '@/settings/roles/role-permissions/objects-permissions/components/PermissionIcon';
import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { IconTrash } from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';

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
      startIcon={
        <PermissionIcon
          permission={permission.key}
          state={alwaysShowGranted || isEnabled ? 'granted' : 'revoked'}
        />
      }
    >
      {permission.label}
    </ListItem>
  );
};
