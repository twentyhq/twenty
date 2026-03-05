import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';

import { styled } from '@linaria/react';
import { useContext } from 'react';
import { IconChevronDown } from 'twenty-ui/display';
import { type SelectOption } from 'twenty-ui/input';
import { MenuItemSelect } from 'twenty-ui/navigation';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledDropdownMenuInnerSelectDropdownButton = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};

  font-weight: ${themeCssVariables.font.weight.medium};
  height: ${themeCssVariables.spacing[7]};

  justify-content: space-between;

  padding-left: ${themeCssVariables.spacing[2]};
  padding-right: ${themeCssVariables.spacing[2]};
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
  const { theme } = useContext(ThemeContext);
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
