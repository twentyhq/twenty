import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/surfaces';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';

import { styled } from '@linaria/react';
import { useContext } from 'react';
import { IconChevronDown } from 'twenty-ui/icon';
import { type SelectOption } from 'twenty-ui/primitives/input';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledDropdownMenuInnerSelectDropdownButton = styled.div`
  align-items: center;
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;

  display: flex;
  font-size: ${themeCssVariables.font.size.sm};

  font-weight: ${themeCssVariables.font.weight.medium};

  height: ${themeCssVariables.spacing[7]};
  justify-content: space-between;
  padding-left: ${themeCssVariables.spacing[2]};

  padding-right: ${themeCssVariables.spacing[2]};
  width: 100%;
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
              <ListItem
                key={`dropdown-menu-inner-select-item-${selectOption.value}`}
                onClick={() => {
                  onChange(selectOption);
                  closeDropdown(dropdownId);
                }}
                disabled={selectOption.disabled}
                role="option"
                aria-selected={selectOption.value === selectedOption.value}
                selected={selectOption.value === selectedOption.value}
                indicator="check"
              >
                <OverflowingTextWithTooltip text={selectOption.label} />
              </ListItem>
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
