import { PermissionIcon } from '@/settings/roles/role-permissions/objects-permissions/components/PermissionIcon';
import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { IconTrash } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import {
  StyledIconContainer,
  StyledRow,
  StyledRowLeftContent,
  StyledText,
} from './WorkflowAiAgentPermissions.styles';

type WorkflowAiAgentPermissionsPermissionRowProps = {
  permission: {
    key: SettingsRoleObjectPermissionKey;
    label: string;
  };
  isEnabled: boolean;
  readonly: boolean;
  onAdd?: () => void;
  onDelete?: () => void;
};

export const WorkflowAiAgentPermissionsPermissionRow = ({
  permission,
  isEnabled,
  readonly,
  onAdd,
  onDelete,
}: WorkflowAiAgentPermissionsPermissionRowProps) => {
  return (
    <StyledRow onClick={!readonly && !isEnabled ? onAdd : undefined}>
      <StyledRowLeftContent>
        <StyledIconContainer>
          <PermissionIcon
            permission={permission.key}
            state={isEnabled ? 'granted' : 'revoked'}
          />
        </StyledIconContainer>
        <StyledText>{permission.label}</StyledText>
      </StyledRowLeftContent>
      {isEnabled && (
        <IconButton
          Icon={IconTrash}
          variant="tertiary"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
        />
      )}
    </StyledRow>
  );
};
