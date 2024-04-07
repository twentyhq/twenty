import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconChevronDown } from 'twenty-ui';

import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { ActionBarEntry } from '@/ui/navigation/action-bar/types/ActionBarEntry';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { MenuItemAccent } from '@/ui/navigation/menu-item/types/MenuItemAccent';

type ActionBarItemProps = {
  item: ActionBarEntry;
};

const StyledButton = styled.div<{ accent: MenuItemAccent }>`
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${(props) =>
    props.accent === 'danger'
      ? props.theme.color.red
      : props.theme.font.color.secondary};
  cursor: pointer;
  display: flex;
  justify-content: center;

  padding: ${({ theme }) => theme.spacing(2)};
  transition: background 0.1s ease;
  user-select: none;

  &:hover {
    background: ${({ theme, accent }) =>
      accent === 'danger'
        ? theme.background.danger
        : theme.background.tertiary};
  }
`;

const StyledButtonLabel = styled.div`
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-left: ${({ theme }) => theme.spacing(1)};
`;

export const ActionBarItem = ({ item }: ActionBarItemProps) => {
  const theme = useTheme();
  const dropdownId = `action-bar-item-${item.label}`;
  const { toggleDropdown, closeDropdown } = useDropdown(dropdownId);
  return (
    <>
      {Array.isArray(item.subActions) ? (
        <Dropdown
          dropdownId={dropdownId}
          dropdownPlacement="top-start"
          dropdownHotkeyScope={{
            scope: dropdownId,
          }}
          clickableComponent={
            <StyledButton
              accent={item.accent ?? 'default'}
              onClick={toggleDropdown}
            >
              {item.Icon && <item.Icon size={theme.icon.size.md} />}
              <StyledButtonLabel>{item.label}</StyledButtonLabel>
              <IconChevronDown size={theme.icon.size.md} />
            </StyledButton>
          }
          dropdownComponents={
            <DropdownMenuItemsContainer>
              {item.subActions.map((subAction) => (
                <MenuItem
                  key={subAction.label}
                  text={subAction.label}
                  LeftIcon={subAction.Icon}
                  onClick={() => {
                    closeDropdown();
                    subAction.onClick?.();
                  }}
                />
              ))}
            </DropdownMenuItemsContainer>
          }
        />
      ) : (
        <StyledButton
          accent={item.accent ?? 'default'}
          onClick={() => item.onClick?.()}
        >
          {item.Icon && <item.Icon size={theme.icon.size.md} />}
          <StyledButtonLabel>{item.label}</StyledButtonLabel>
        </StyledButton>
      )}
    </>
  );
};
