import styled from '@emotion/styled';

import { FormFieldInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputContainer';
import { FormFieldInputInnerContainer } from '@/object-record/record-field/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/form-types/components/FormFieldInputRowContainer';
import { VariableChipStandalone } from '@/object-record/record-field/form-types/components/VariableChipStandalone';
import { FormMultiSelectFieldInputHotKeyScope } from '@/object-record/record-field/form-types/constants/FormMultiSelectFieldInputHotKeyScope';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { SELECT_FIELD_INPUT_SELECTABLE_LIST_COMPONENT_INSTANCE_ID } from '@/object-record/record-field/meta-types/input/constants/SelectFieldInputSelectableListComponentInstanceId';
import { FieldMultiSelectValue } from '@/object-record/record-field/types/FieldMetadata';
import { MultiSelectDisplay } from '@/ui/field/display/components/MultiSelectDisplay';
import { MultiSelectInput } from '@/ui/field/input/components/MultiSelectInput';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';
import { useTheme } from '@emotion/react';
import { useId, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { VisibilityHidden } from 'twenty-ui/accessibility';
import { IconChevronDown } from 'twenty-ui/display';
import { SelectOption } from 'twenty-ui/input';

type FormMultiSelectFieldInputProps = {
  label?: string;
  defaultValue: FieldMultiSelectValue | string | undefined;
  options: SelectOption[];
  onChange: (value: FieldMultiSelectValue | string) => void;
  VariablePicker?: VariablePickerComponent;
  readonly?: boolean;
  placeholder?: string;
  testId?: string;
};

const StyledDisplayModeReadonlyContainer = styled.div`
  align-items: center;
  background: transparent;
  border: none;
  display: flex;
  font-family: inherit;
  padding-inline: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledDisplayModeContainer = styled(StyledDisplayModeReadonlyContainer)`
  cursor: pointer;

  &:hover,
  &[data-open='true'] {
    background-color: ${({ theme }) => theme.background.transparent.lighter};
  }
`;

const StyledSelectInputContainer = styled.div`
  position: absolute;
  z-index: 1;
  top: ${({ theme }) => theme.spacing(8)};
`;

const StyledPlaceholder = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  width: 100%;
`;

export const FormMultiSelectFieldInput = ({
  label,
  defaultValue,
  options,
  onChange,
  VariablePicker,
  readonly,
  placeholder,
  testId,
}: FormMultiSelectFieldInputProps) => {
  const inputId = useId();
  const theme = useTheme();

  const hotkeyScope =
    FormMultiSelectFieldInputHotKeyScope.FormMultiSelectFieldInput;

  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const [draftValue, setDraftValue] = useState<
    | {
        type: 'static';
        value: FieldMultiSelectValue;
        editingMode: 'view' | 'edit';
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
          editingMode: 'view',
        },
  );

  const handleDisplayModeClick = () => {
    if (draftValue.type !== 'static') {
      throw new Error(
        'This function can only be called when editing a static value.',
      );
    }

    setDraftValue({
      ...draftValue,
      editingMode: 'edit',
    });

    setHotkeyScopeAndMemorizePreviousScope(hotkeyScope);
  };

  const onOptionSelected = (value: FieldMultiSelectValue) => {
    if (draftValue.type !== 'static') {
      throw new Error('Can only be called when editing a static value');
    }

    setDraftValue({
      type: 'static',
      value,
      editingMode: 'edit',
    });

    onChange(value);
  };

  const onCancel = () => {
    if (draftValue.type !== 'static') {
      throw new Error('Can only be called when editing a static value');
    }

    setDraftValue({
      ...draftValue,
      editingMode: 'view',
    });

    goBackToPreviousHotkeyScope();
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
      editingMode: 'view',
    });

    onChange([]);
  };

  const selectedNames =
    draftValue.type === 'static' ? draftValue.value : undefined;

  const selectedOptions =
    isDefined(selectedNames) && isDefined(options)
      ? options.filter((option) =>
          selectedNames.some((name) => option.value === name),
        )
      : undefined;

  const placeholderText = placeholder ?? label;

  return (
    <FormFieldInputContainer testId={testId}>
      {label ? <InputLabel>{label}</InputLabel> : null}

      <FormFieldInputRowContainer>
        <FormFieldInputInnerContainer
          hasRightElement={isDefined(VariablePicker) && !readonly}
        >
          {draftValue.type === 'static' ? (
            readonly ? (
              <StyledDisplayModeReadonlyContainer>
                {isDefined(selectedOptions) && selectedOptions.length > 0 ? (
                  <MultiSelectDisplay
                    values={selectedNames}
                    options={selectedOptions}
                  />
                ) : (
                  <StyledPlaceholder />
                )}
                <IconChevronDown
                  size={theme.icon.size.md}
                  color={theme.font.color.light}
                />
              </StyledDisplayModeReadonlyContainer>
            ) : (
              <StyledDisplayModeContainer
                data-open={draftValue.editingMode === 'edit'}
                onClick={handleDisplayModeClick}
              >
                <VisibilityHidden>Edit</VisibilityHidden>

                {isDefined(selectedOptions) && selectedOptions.length > 0 ? (
                  <MultiSelectDisplay
                    values={selectedNames}
                    options={selectedOptions}
                  />
                ) : (
                  <StyledPlaceholder>{placeholderText}</StyledPlaceholder>
                )}
                <IconChevronDown
                  size={theme.icon.size.md}
                  color={theme.font.color.tertiary}
                />
              </StyledDisplayModeContainer>
            )
          ) : (
            <VariableChipStandalone
              rawVariableName={draftValue.value}
              onRemove={readonly ? undefined : handleUnlinkVariable}
            />
          )}
        </FormFieldInputInnerContainer>
        <StyledSelectInputContainer>
          {draftValue.type === 'static' &&
            draftValue.editingMode === 'edit' && (
              <OverlayContainer>
                <MultiSelectInput
                  selectableListComponentInstanceId={
                    SELECT_FIELD_INPUT_SELECTABLE_LIST_COMPONENT_INSTANCE_ID
                  }
                  hotkeyScope={hotkeyScope}
                  options={options}
                  onCancel={onCancel}
                  onOptionSelected={onOptionSelected}
                  values={draftValue.value}
                />
              </OverlayContainer>
            )}
        </StyledSelectInputContainer>

        {VariablePicker && !readonly && (
          <VariablePicker
            inputId={inputId}
            onVariableSelect={handleVariableTagInsert}
          />
        )}
      </FormFieldInputRowContainer>
    </FormFieldInputContainer>
  );
};
