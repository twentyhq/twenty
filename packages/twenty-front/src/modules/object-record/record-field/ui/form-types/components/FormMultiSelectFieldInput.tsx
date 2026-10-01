import { styled } from '@linaria/react';

import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { FormFieldPlaceholder } from '@/object-record/record-field/ui/form-types/components/FormFieldPlaceholder';
import { VariableChipStandalone } from '@/object-record/record-field/ui/form-types/components/VariableChipStandalone';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { type FieldMultiSelectValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { MultiSelectDisplay } from '@/ui/field/display/components/MultiSelectDisplay';
import { MultiSelectInput } from '@/ui/field/input/components/MultiSelectInput';
import { Field, type SelectOption } from 'twenty-ui/primitives/input';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { isStandaloneVariableString } from 'twenty-shared/workflow';
import { isArray } from '@sniptt/guards';
import { useId, useRef, useState } from 'react';
import { Key } from 'ts-key-enum';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { getDropdownTabTarget } from '@/ui/layout/dropdown/utils/getDropdownTabTarget';
import { IconChevronDown } from 'twenty-ui/icon';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

type FormMultiSelectFieldInputProps = {
  label?: string;
  defaultValue: FieldMultiSelectValue | string | undefined;
  options: SelectOption[];
  onChange: (value: FieldMultiSelectValue | string) => void;
  VariablePicker?: VariablePickerComponent;
  readonly?: boolean;
  placeholder?: string;
  testId?: string;
  hint?: string;
  dropdownWidth?: number;
};

const StyledFormFieldInputRowContainer = styled(FormFieldInputRowContainer)`
  height: auto;
  min-height: 32px;
`;

const StyledMultiSelectDisplay = styled(MultiSelectDisplay)`
  flex-wrap: wrap;
`;

const StyledDisplayModeReadonlyContainer = styled.div`
  align-items: center;
  background: transparent;
  border: none;
  display: flex;
  font-family: inherit;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledDisplayModeContainer = styled.div`
  align-items: center;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  font-family: inherit;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledPlaceholderContainer = styled.div`
  width: 100%;
`;

const safeParsedValue = (value: string) => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

export const FormMultiSelectFieldInput = ({
  label,
  defaultValue,
  options,
  onChange,
  VariablePicker,
  readonly,
  placeholder,
  testId,
  hint,
  dropdownWidth,
}: FormMultiSelectFieldInputProps) => {
  const theme = useTheme();
  const instanceId = useId();
  const triggerRef = useRef<HTMLElement>(null);
  const { closeDropdown } = useCloseDropdown();

  const [draftValue, setDraftValue] = useState<
    | {
        type: 'static';
        value: FieldMultiSelectValue | string;
      }
    | {
        type: 'variable';
        value: string;
      }
  >(
    isStandaloneVariableString(defaultValue)
      ? {
          type: 'variable',
          value: defaultValue,
        }
      : {
          type: 'static',
          value: isDefined(defaultValue) ? defaultValue : [],
        },
  );

  const onOptionSelected = (value: FieldMultiSelectValue) => {
    if (draftValue.type !== 'static') {
      throw new Error('Can only be called when editing a static value');
    }

    setDraftValue({
      type: 'static',
      value,
    });

    onChange(value);
  };

  const handleVariableTagInsert = (variableName: string) => {
    setDraftValue({
      type: 'variable',
      value: variableName,
    });

    onChange(variableName);
  };

  const handleUnlinkVariable = () => {
    setDraftValue({
      type: 'static',
      value: [],
    });

    onChange([]);
  };

  const selectedNames =
    draftValue.type === 'static' && isDefined(draftValue.value)
      ? isArray(draftValue.value)
        ? draftValue.value
        : safeParsedValue(draftValue.value)
      : undefined;

  const selectedOptions =
    isDefined(selectedNames) && isDefined(options) && isArray(selectedNames)
      ? options.filter((option) =>
          selectedNames.some((name) => option.value === name),
        )
      : undefined;

  const placeholderText = placeholder ?? label;

  return (
    <FormFieldInputContainer data-testid={testId}>
      {label ? <Field.Label>{label}</Field.Label> : null}

      <StyledFormFieldInputRowContainer>
        <FormFieldInputInnerContainer
          formFieldInputInstanceId={instanceId}
          hasRightElement={isDefined(VariablePicker) && !readonly}
          hoverable={!readonly}
          preventFocusStackUpdate={draftValue.type === 'static' && !readonly}
        >
          {draftValue.type === 'static' ? (
            readonly ? (
              <StyledDisplayModeReadonlyContainer>
                {isNonEmptyArray(selectedOptions) ? (
                  <StyledMultiSelectDisplay
                    values={selectedNames}
                    options={selectedOptions}
                  />
                ) : (
                  <StyledPlaceholderContainer>
                    <FormFieldPlaceholder />
                  </StyledPlaceholderContainer>
                )}
                <IconChevronDown
                  size={theme.icon.size.md}
                  color={theme.font.color.light}
                />
              </StyledDisplayModeReadonlyContainer>
            ) : (
              <DropdownRoot
                dropdownId={instanceId}
                type="picker"
                multiple
                onInteractOutside={(event) => {
                  if (event.target instanceof HTMLInputElement) {
                    event.preventDefault();
                  }
                }}
              >
                <Dropdown.Trigger
                  ref={(element) => {
                    triggerRef.current = element;
                  }}
                  render={<StyledDisplayModeContainer />}
                  nativeButton={false}
                  aria-label={label ?? placeholder}
                >
                  {isNonEmptyArray(selectedOptions) ? (
                    <StyledMultiSelectDisplay
                      values={selectedNames}
                      options={selectedOptions}
                    />
                  ) : (
                    <StyledPlaceholderContainer>
                      <FormFieldPlaceholder>
                        {placeholderText}
                      </FormFieldPlaceholder>
                    </StyledPlaceholderContainer>
                  )}
                  <IconChevronDown
                    size={theme.icon.size.md}
                    color={theme.font.color.tertiary}
                  />
                </Dropdown.Trigger>
                <DropdownContent
                  onKeyDown={(event) => {
                    if (
                      event.key !== Key.Tab ||
                      !isDefined(triggerRef.current)
                    ) {
                      return;
                    }

                    event.preventDefault();
                    const tabTarget = getDropdownTabTarget({
                      trigger: triggerRef.current,
                      popup: event.currentTarget,
                      isBackward: event.shiftKey,
                    });
                    tabTarget.focus();
                    closeDropdown(instanceId);
                  }}
                  align="start"
                  sideOffset={parseInt(theme.spacing[1], 10)}
                  width={
                    dropdownWidth ?? GenericDropdownContentWidth.ExtraLarge
                  }
                  aria-label={label ?? placeholder}
                >
                  <MultiSelectInput
                    options={options}
                    onOptionSelected={onOptionSelected}
                    onEnter={() => closeDropdown(instanceId)}
                    values={selectedNames}
                  />
                </DropdownContent>
              </DropdownRoot>
            )
          ) : (
            <VariableChipStandalone
              rawVariableName={draftValue.value}
              onRemove={readonly ? undefined : handleUnlinkVariable}
            />
          )}
        </FormFieldInputInnerContainer>

        {isDefined(VariablePicker) && !readonly && (
          <VariablePicker
            instanceId={instanceId}
            onVariableSelect={handleVariableTagInsert}
          />
        )}
      </StyledFormFieldInputRowContainer>
      {hint ? <Field.Description>{hint}</Field.Description> : null}
    </FormFieldInputContainer>
  );
};
