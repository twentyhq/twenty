import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconComponent } from '@/ui/display/icon/types/IconComponent';

import { ActionBarItemAccent } from '../types/ActionBarItemAccent';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { MenuItem } from 'tsup.ui.index';
import { IconPencil, IconArchive, IconChevronDown } from '@/ui/display/icon';

type ActionBarItemProps = {
  Icon: IconComponent;
  label: string;
  accent?: ActionBarItemAccent;
  onClick: () => void;
  subActions?: ActionBarItemProps[];
};

const StyledButton = styled.div<{ accent: ActionBarItemAccent }>`
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

export const ActionBarItem = ({
  label,
  Icon,
  accent = 'standard',
  onClick,
  subActions,
}: ActionBarItemProps) => {
  const theme = useTheme();
  const dropdownScopeId = `action-bar-item-${label}`;
  const { toggleDropdown } = useDropdown( dropdownScopeId );
  return (
    <>
    {Array.isArray(subActions) ? (
        <DropdownScope dropdownScopeId={dropdownScopeId}>
          <Dropdown
            dropdownPlacement="bottom-start"
            dropdownHotkeyScope={{
              scope: dropdownScopeId,
            }}
            clickableComponent={
              <StyledButton accent={accent} onClick={toggleDropdown}>
                {Icon && <Icon size={theme.icon.size.md} />}
                <StyledButtonLabel>{label}</StyledButtonLabel>
                <IconChevronDown size={theme.icon.size.md} />
              </StyledButton>
            }
            dropdownComponents={
              <DropdownMenu>
                <DropdownMenuItemsContainer>
                  {subActions.map((subAction) => (
                    <MenuItem
                      key={subAction.label}
                      text={subAction.label}
                      LeftIcon={subAction.Icon}
                      onClick={subAction.onClick}
                    />
                  ))}
                </DropdownMenuItemsContainer>
              </DropdownMenu>
            }
          />
        </DropdownScope>
      ) : (
        <StyledButton accent={accent} onClick={onClick}>
          {Icon && <Icon size={theme.icon.size.md} />}
          <StyledButtonLabel>{label}</StyledButtonLabel>
        </StyledButton>
      )}
    </>
  );
};
