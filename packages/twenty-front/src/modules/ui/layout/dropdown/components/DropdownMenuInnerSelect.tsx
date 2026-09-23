import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { ClickOutsideListenerContext } from '@/ui/utilities/pointer-event/contexts/ClickOutsideListenerContext';
import { ParentClickOutsideIdContext } from '@/ui/utilities/pointer-event/contexts/ParentClickOutsideIdContext';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { Dropdown } from 'twenty-ui/components';
import { IconChevronDown } from 'twenty-ui/icon';
import { type SelectOption } from 'twenty-ui/primitives/input';
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

type DropdownMenuInnerSelectProps = {
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
  const { excludedClickOutsideId } = useContext(ClickOutsideListenerContext);
  const parentClickOutsideId = useContext(ParentClickOutsideIdContext);

  const { theme } = useContext(ThemeContext);

  return (
    <DropdownRoot
      dropdownId={dropdownId}
      type="picker"
      globalHotkeysConfig={{
        enableGlobalHotkeysWithModifiers: false,
        enableGlobalHotkeysConflictingWithKeyboard: false,
      }}
    >
      <Dropdown.Trigger render={<div />} nativeButton={false}>
        <StyledDropdownMenuInnerSelectDropdownButton>
          <span>{selectedOption.label}</span>
          <IconChevronDown size={theme.icon.size.sm} />
        </StyledDropdownMenuInnerSelectDropdownButton>
      </Dropdown.Trigger>
      <Dropdown.Content
        width={widthInPixels}
        side="bottom"
        align="end"
        alignOffset={8}
        data-click-outside-id={excludedClickOutsideId}
      >
        <div data-click-outside-id={parentClickOutsideId}>
          <Dropdown.Section>
            {options.map((selectOption) => (
              <Dropdown.OptionItem
                key={`dropdown-menu-inner-select-item-${selectOption.value}`}
                onSelect={() => onChange(selectOption)}
                disabled={selectOption.disabled}
                selected={selectOption.value === selectedOption.value}
              >
                {selectOption.label}
              </Dropdown.OptionItem>
            ))}
          </Dropdown.Section>
        </div>
      </Dropdown.Content>
    </DropdownRoot>
  );
};
