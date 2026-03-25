import { PermissionIcon } from '@/settings/roles/role-permissions/objects-permissions/components/PermissionIcon';
import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { IconTrash } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import {
  StyledDeleteButton,
  StyledIconContainer,
  StyledRow,
  StyledRowLeftContent,
  StyledText,
} from './WorkflowAiAgentPermissionsStyles';

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

  return (
    <StyledRow
      onClick={isClickable ? onAdd : undefined}
      isDisabled={isDisabled}
    >
      <StyledRowLeftContent>
        <StyledIconContainer>
          <PermissionIcon
            permission={permission.key}
            state={alwaysShowGranted || isEnabled ? 'granted' : 'revoked'}
          />
        </StyledIconContainer>
        <StyledText>{permission.label}</StyledText>
      </StyledRowLeftContent>
      {isEnabled && showDeleteButton && (
        <StyledDeleteButton data-delete-button>
          <IconButton
            Icon={IconTrash}
            variant="tertiary"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
          />
        </StyledDeleteButton>
      )}
    </StyledRow>
  );
};
