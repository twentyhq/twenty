import { useNavigate } from 'react-router-dom';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { Account } from '@/accounts/interface/Account';
import { IconDotsVertical, IconMail, IconTrash } from '@/ui/display/icon';
import { IconGoogle } from '@/ui/display/icon/components/IconGoogle';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { CardContent } from '@/ui/layout/card/components/CardContent';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';

const StyledRow = styled(CardContent)`
  align-items: center;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  padding-left: ${({ theme }) => theme.spacing(4)};
`;

const StyledDropdown = styled(Dropdown)`
  margin-left: auto;
`;

type SettingsAccountRowProps = {
  account: Account;
  divider?: boolean;
  onRemove?: (uuid: string) => void;
};

export const SettingsAccountRow = ({
  account,
  divider,
  onRemove,
}: SettingsAccountRowProps) => {
  const dropdownScopeId = `settings-account-row-${account.uuid}`;

  const theme = useTheme();
  const navigate = useNavigate();
  const { closeDropdown } = useDropdown({ dropdownScopeId });

  return (
    <StyledRow divider={divider}>
      <IconGoogle size={theme.icon.size.sm} />
      {account.email}
      <DropdownScope dropdownScopeId={dropdownScopeId}>
        <StyledDropdown
          dropdownPlacement="right-start"
          dropdownHotkeyScope={{ scope: dropdownScopeId }}
          clickableComponent={
            <LightIconButton Icon={IconDotsVertical} accent="tertiary" />
          }
          dropdownComponents={
            <DropdownMenu>
              <DropdownMenuItemsContainer>
                <MenuItem
                  LeftIcon={IconMail}
                  text="Emails settings"
                  onClick={() => {
                    navigate(`/settings/accounts/emails/${account.uuid}`);
                    closeDropdown();
                  }}
                />
                {!!onRemove && (
                  <MenuItem
                    accent="danger"
                    LeftIcon={IconTrash}
                    text="Remove account"
                    onClick={() => {
                      onRemove(account.uuid);
                      closeDropdown();
                    }}
                  />
                )}
              </DropdownMenuItemsContainer>
            </DropdownMenu>
          }
        />
      </DropdownScope>
    </StyledRow>
  );
};
