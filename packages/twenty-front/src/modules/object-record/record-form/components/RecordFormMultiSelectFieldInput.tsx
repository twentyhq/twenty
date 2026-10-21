import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { FormFieldPlaceholder } from '@/object-record/record-field/ui/form-types/components/FormFieldPlaceholder';
import { type FieldMultiSelectValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { MultiSelectDisplay } from '@/ui/field/display/components/MultiSelectDisplay';
import { MultiSelectInput } from '@/ui/field/input/components/MultiSelectInput';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { preventDropdownDismissOnInputElement } from '@/ui/layout/dropdown/utils/preventDropdownDismissOnInputElement';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useId } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconChevronDown } from 'twenty-ui/icon';
import { Field, type SelectOption } from 'twenty-ui/primitives/input';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledFormFieldInputRowContainer = styled(FormFieldInputRowContainer)`
  height: auto;
  min-height: 32px;
`;

const StyledMultiSelectDisplay = styled(MultiSelectDisplay)`
  flex-wrap: wrap;
`;

const StyledDisplayModeContainer = styled.div<{ readonly?: boolean }>`
  align-items: center;
  cursor: ${({ readonly }) => (readonly ? 'default' : 'pointer')};
  display: flex;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledPlaceholderContainer = styled.div`
  width: 100%;
`;

type RecordFormMultiSelectFieldInputProps = {
  label?: string;
  defaultValue?: FieldMultiSelectValue;
  options: SelectOption[];
  onChange: (value: FieldMultiSelectValue) => void;
  readonly?: boolean;
  placeholder?: string;
};

export const RecordFormMultiSelectFieldInput = ({
  label,
  defaultValue,
  options,
  onChange,
  readonly,
  placeholder,
}: RecordFormMultiSelectFieldInputProps) => {
  const theme = useTheme();
  const instanceId = useId();
  const { closeDropdown } = useCloseDropdown();

  const selectedValues = defaultValue ?? [];
  const selectedOptions = options.filter((option) =>
    selectedValues.includes(option.value),
  );

  const accessibleLabel =
    [label, placeholder].find(isNonEmptyString) ?? t`Select options`;

  const selectedValuesDisplay = isNonEmptyArray(selectedOptions) ? (
    <StyledMultiSelectDisplay
      values={selectedValues}
      options={selectedOptions}
    />
  ) : (
    <StyledPlaceholderContainer>
      <FormFieldPlaceholder>
        {readonly ? undefined : (placeholder ?? label)}
      </FormFieldPlaceholder>
    </StyledPlaceholderContainer>
  );

  return (
    <FormFieldInputContainer>
      {label ? <Field.Label>{label}</Field.Label> : null}

      <StyledFormFieldInputRowContainer>
        <FormFieldInputInnerContainer
          formFieldInputInstanceId={instanceId}
          hasRightElement={false}
          hoverable={!readonly}
          preventFocusStackUpdate={!readonly}
        >
          {readonly ? (
            <StyledDisplayModeContainer readonly>
              {selectedValuesDisplay}
              <IconChevronDown
                size={theme.icon.size.md}
                color={theme.font.color.light}
              />
            </StyledDisplayModeContainer>
          ) : (
            <DropdownRoot
              dropdownId={instanceId}
              type="picker"
              multiple
              onInteractOutside={preventDropdownDismissOnInputElement}
            >
              <Dropdown.Trigger
                render={<StyledDisplayModeContainer />}
                nativeButton={false}
                aria-label={accessibleLabel}
              >
                {selectedValuesDisplay}
                <IconChevronDown
                  size={theme.icon.size.md}
                  color={theme.font.color.tertiary}
                />
              </Dropdown.Trigger>
              <DropdownContent
                align="start"
                sideOffset={parseInt(theme.spacing[1], 10)}
                width={GenericDropdownContentWidth.ExtraLarge}
                aria-label={accessibleLabel}
              >
                <MultiSelectInput
                  options={options}
                  onOptionSelected={onChange}
                  onEnter={() => closeDropdown(instanceId)}
                  values={selectedValues}
                />
              </DropdownContent>
            </DropdownRoot>
          )}
        </FormFieldInputInnerContainer>
      </StyledFormFieldInputRowContainer>
    </FormFieldInputContainer>
  );
};
