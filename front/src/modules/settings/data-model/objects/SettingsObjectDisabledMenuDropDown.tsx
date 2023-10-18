import styled from '@emotion/styled';

import { IconDotsVertical, IconTrash } from '@/ui/display/icon';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { IconArchiveOff } from '@/ui/input/constants/icons';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';

type SettingsObjectDisabledMenuDropDownProps = {
  scopeKey: string;
};

const StyledDropdownMenuItemsContainer = styled.div`
  align-items: flex-start;
  backdrop-filter: blur(20px);
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};

  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: ${({ theme }) => theme.spacing(1)};
  width: 160px;
`;

export const SettingsObjectDisabledMenuDropDown = ({
  scopeKey,
}: SettingsObjectDisabledMenuDropDownProps) => {
  return (
    <DropdownScope
      dropdownScopeId={scopeKey + '-settings-object-disabled-menu-dropdown'}
    >
      <DropdownMenu
        clickableComponent={
          <LightIconButton Icon={IconDotsVertical} accent="tertiary" />
        }
        dropdownComponents={
          <StyledDropdownMenuItemsContainer>
            <MenuItem text="Activate" LeftIcon={IconArchiveOff} />
            <MenuItem text="Erase" LeftIcon={IconTrash} accent="danger" />
          </StyledDropdownMenuItemsContainer>
        }
        dropdownHotkeyScope={{
          scope: scopeKey + '-settings-object-disabled-menu-dropdown',
        }}
      />
    </DropdownScope>
  );
};
