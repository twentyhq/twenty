import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconPlus, IconX, useIcons } from 'twenty-ui/icon';
import { Button, LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useSettingsAllRoles } from '@/settings/roles/hooks/useSettingsAllRoles';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { sortByAscString } from '~/utils/array/sortByAscString';

const INBOX_QUEUE_ROLE_DROPDOWN_ID = 'inbox-queue-role-select';

const StyledList = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
`;

const StyledRow = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};

  &:last-of-type {
    border-bottom: none;
  }
`;

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
`;

const StyledEmpty = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.md};
  padding: ${themeCssVariables.spacing[4]};
  text-align: center;
`;

const StyledAddRow = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: ${themeCssVariables.spacing[2]};
`;

// Which roles can reach this shared inbox. Access is a permission, so it is
// granted to roles rather than named people; who ends up doing the work is
// decided later by routing.
export const SettingsInboxQueueRolePicker = ({
  selectedRoleIds,
  onChange,
}: {
  selectedRoleIds: string[];
  onChange: (roleIds: string[]) => void;
}) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { closeDropdown } = useCloseDropdown();
  const roles = useSettingsAllRoles();

  const selectedRoles = selectedRoleIds
    .map((roleId) => roles.find(({ id }) => id === roleId))
    .filter((role) => role !== undefined);

  const availableRoles = roles
    .filter(
      (role) => role.canBeAssignedToUsers && !selectedRoleIds.includes(role.id),
    )
    .sort((roleA, roleB) => sortByAscString(roleA.label, roleB.label));

  return (
    <>
      {selectedRoles.length === 0 ? (
        <StyledEmpty>{t`No role can reach this inbox yet`}</StyledEmpty>
      ) : (
        <StyledList>
          {selectedRoles.map((role) => {
            const RoleIcon = getIcon(role.icon ?? 'IconUser');

            return (
              <StyledRow key={role.id}>
                <RoleIcon size={16} />
                <StyledLabel>{role.label}</StyledLabel>
                <LightIconButton
                  Icon={IconX}
                  accent="tertiary"
                  aria-label={t`Remove ${role.label}`}
                  onClick={() =>
                    onChange(selectedRoleIds.filter((id) => id !== role.id))
                  }
                />
              </StyledRow>
            );
          })}
        </StyledList>
      )}
      <StyledAddRow>
        <Dropdown
          dropdownId={INBOX_QUEUE_ROLE_DROPDOWN_ID}
          dropdownOffset={{ x: 0, y: 4 }}
          clickableComponent={
            <Button
              Icon={IconPlus}
              title={t`Add role`}
              variant="secondary"
              size="small"
              disabled={availableRoles.length === 0}
            />
          }
          dropdownComponents={
            <DropdownContent
              widthInPixels={GenericDropdownContentWidth.ExtraLarge}
            >
              <DropdownMenuItemsContainer hasMaxHeight>
                {availableRoles.map((role) => (
                  <MenuItem
                    key={role.id}
                    LeftIcon={getIcon(role.icon ?? 'IconUser')}
                    text={role.label}
                    onClick={() => {
                      closeDropdown(INBOX_QUEUE_ROLE_DROPDOWN_ID);
                      onChange([...selectedRoleIds, role.id]);
                    }}
                  />
                ))}
              </DropdownMenuItemsContainer>
            </DropdownContent>
          }
        />
      </StyledAddRow>
    </>
  );
};
