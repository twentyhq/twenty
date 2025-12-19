import { type SettingsRolePermissionsSettingPermission } from '@/settings/roles/role-permissions/permission-flags/types/SettingsRolePermissionsSettingPermission';
import { useTheme } from '@emotion/react';
import { IconTrash } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import {
  StyledDeleteButton,
  StyledIconContainer,
  StyledRow,
  StyledRowLeftContent,
  StyledText,
} from './WorkflowAiAgentPermissionsStyles';

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
  const theme = useTheme();
  const isClickable = !readonly && !isEnabled && Boolean(onAdd);
  const isDisabled = isEnabled && !showDeleteButton;

  return (
    <StyledRow
      onClick={isClickable ? onAdd : undefined}
      isDisabled={isDisabled}
    >
      <StyledRowLeftContent>
        <StyledIconContainer>
          <permission.Icon size={theme.icon.size.sm} />
        </StyledIconContainer>
        <StyledText>{permission.name}</StyledText>
      </StyledRowLeftContent>
      {isEnabled && showDeleteButton && (
        <StyledDeleteButton data-delete-button>
          <IconButton
            Icon={IconTrash}
            variant="tertiary"
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              onDelete?.();
            }}
          />
        </StyledDeleteButton>
      )}
    </StyledRow>
  );
};
