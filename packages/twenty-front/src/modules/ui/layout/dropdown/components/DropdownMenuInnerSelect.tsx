import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconChevronDown } from 'twenty-ui/icon';
import { type SelectOption } from 'twenty-ui/primitives/input';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

const StyledDropdownMenuInnerSelectDropdownButton = styled.div`
  align-items: center;
  border-radius: ${themeCssVariables.border.radius.sm};
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

  @media (hover: hover) {
    &:hover {
      background: ${themeCssVariables.background.transparent.light};
    }
  }

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.color.blue};
    outline-offset: -2px;
  }
`;

type DropdownMenuInnerSelectProps = {
  selectedOption: SelectOption;
  onChange: (value: SelectOption) => void;
  options: SelectOption[];
  dropdownId: string;
  widthInPixels?: number;
  'aria-label': string;
};

export const DropdownMenuInnerSelect = ({
  selectedOption,
  onChange,
  options,
  dropdownId,
  widthInPixels,
  'aria-label': ariaLabel,
}: DropdownMenuInnerSelectProps) => {
  const theme = useTheme();

  return (
    <DropdownRoot
      dropdownId={dropdownId}
      type="picker"
      globalHotkeysConfig={{
        enableGlobalHotkeysWithModifiers: false,
        enableGlobalHotkeysConflictingWithKeyboard: false,
      }}
    >
      <Dropdown.Trigger
        render={<StyledDropdownMenuInnerSelectDropdownButton />}
        nativeButton={false}
      >
        <span>{selectedOption.label}</span>
        <IconChevronDown size={theme.icon.size.sm} />
      </Dropdown.Trigger>
      <DropdownContent
        width={widthInPixels}
        side="bottom"
        align="end"
        alignOffset={-8}
        aria-label={ariaLabel}
      >
        <Dropdown.SelectionGroup
          aria-label={ariaLabel}
          value={selectedOption.value}
          onValueChange={(selectedValue) => {
            const option = options.find(
              (option) => option.value === selectedValue,
            );

            if (isDefined(option)) {
              onChange(option);
            }
          }}
        >
          <Dropdown.Section>
            {options.map((selectOption) => (
              <Dropdown.OptionItem
                key={`dropdown-menu-inner-select-item-${selectOption.value}`}
                value={selectOption.value}
                disabled={selectOption.disabled}
              >
                {selectOption.label}
              </Dropdown.OptionItem>
            ))}
          </Dropdown.Section>
        </Dropdown.SelectionGroup>
      </DropdownContent>
    </DropdownRoot>
  );
};
