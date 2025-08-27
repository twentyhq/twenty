import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useTheme } from '@emotion/react';

import styled from '@emotion/styled';
import { IconChevronDown } from 'twenty-ui/display';
import { type SelectOption } from 'twenty-ui/input';
import { MenuItemSelect } from 'twenty-ui/navigation';

const StyledDropdownMenuInnerSelectDropdownButton = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};

  font-weight: ${({ theme }) => theme.font.weight.medium};
  height: ${({ theme }) => theme.spacing(7)};

  justify-content: space-between;

  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
  width: 100%;

  box-sizing: border-box;
  cursor: pointer;
`;

export type DropdownMenuInnerSelectProps = {
  selectedOption: SelectOption;
  onChange: (value: SelectOption) => void;
  options: SelectOption[];
  dropdownId: string;
  widthInPixels?: number;
};

export const DropdownMenuInnerSelect = ({
  selectedOption,
  onChange,
  options,
  dropdownId,
  widthInPixels,
}: DropdownMenuInnerSelectProps) => {
  const theme = useTheme();

  const { closeDropdown } = useCloseDropdown();

  return (
    <Dropdown
      clickableComponent={
        <StyledDropdownMenuInnerSelectDropdownButton>
          <span>{selectedOption.label}</span>
          <IconChevronDown size={theme.icon.size.sm} />
        </StyledDropdownMenuInnerSelectDropdownButton>
      }
      dropdownComponents={
        <DropdownContent widthInPixels={widthInPixels}>
          <DropdownMenuItemsContainer>
            {options.map((selectOption) => (
              <MenuItemSelect
                key={`dropdown-menu-inner-select-item-${selectOption.value}`}
                onClick={() => {
                  onChange(selectOption);
                  closeDropdown(dropdownId);
                }}
                text={selectOption.label}
                disabled={selectOption.disabled}
                selected={selectOption.value === selectedOption.value}
              />
            ))}
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
      globalHotkeysConfig={{
        enableGlobalHotkeysWithModifiers: false,
        enableGlobalHotkeysConflictingWithKeyboard: false,
      }}
      dropdownId={dropdownId}
      dropdownOffset={{
        x: 8,
      }}
    />
  );
};
