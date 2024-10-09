import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconChevronDown } from 'twenty-ui';

import { ActionMenuEntry } from '@/action-menu/types/ActionMenuEntry';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { MenuItemAccent } from '@/ui/navigation/menu-item/types/MenuItemAccent';

type ActionMenuBarEntryProps = {
  entry: ActionMenuEntry;
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

export const ActionMenuBarEntry = ({ entry }: ActionMenuBarEntryProps) => {
  const theme = useTheme();
  const dropdownId = `action-bar-entry-${entry.label}`;
  const { toggleDropdown, closeDropdown } = useDropdown(dropdownId);
  return (
    <>
      {Array.isArray(entry.subActions) ? (
        <Dropdown
          dropdownId={dropdownId}
          dropdownPlacement="top-start"
          dropdownHotkeyScope={{
            scope: dropdownId,
          }}
          clickableComponent={
            <StyledButton
              accent={entry.accent ?? 'default'}
              onClick={toggleDropdown}
            >
              {entry.Icon && <entry.Icon size={theme.icon.size.md} />}
              <StyledButtonLabel>{entry.label}</StyledButtonLabel>
              <IconChevronDown size={theme.icon.size.md} />
            </StyledButton>
          }
          dropdownComponents={
            <DropdownMenuItemsContainer>
              {entry.subActions.map((subAction) => (
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
          accent={entry.accent ?? 'default'}
          onClick={() => entry.onClick?.()}
        >
          {entry.Icon && <entry.Icon size={theme.icon.size.md} />}
          <StyledButtonLabel>{entry.label}</StyledButtonLabel>
        </StyledButton>
      )}
    </>
  );
};
