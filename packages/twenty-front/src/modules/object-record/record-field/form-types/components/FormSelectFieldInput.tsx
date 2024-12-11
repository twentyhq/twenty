import { StyledFormFieldInputContainer } from '@/object-record/record-field/form-types/components/StyledFormFieldInputContainer';
import { StyledFormFieldInputInputContainer } from '@/object-record/record-field/form-types/components/StyledFormFieldInputInputContainer';
import { StyledFormFieldInputRowContainer } from '@/object-record/record-field/form-types/components/StyledFormFieldInputRowContainer';
import { VariableChip } from '@/object-record/record-field/form-types/components/VariableChip';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldSelectMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { InlineCellHotkeyScope } from '@/object-record/record-inline-cell/types/InlineCellHotkeyScope';
import { SINGLE_RECORD_SELECT_BASE_LIST } from '@/object-record/relation-picker/constants/SingleRecordSelectBaseList';
import { SelectOption } from '@/spreadsheet-import/types';
import { SelectDisplay } from '@/ui/field/display/components/SelectDisplay';
import { SelectInput } from '@/ui/field/input/components/SelectInput';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';
import styled from '@emotion/styled';
import { useId, useState } from 'react';
import { Key } from 'ts-key-enum';
import { isDefined, VisibilityHidden } from 'twenty-ui';

type FormSelectFieldInputProps = {
  field: FieldDefinition<FieldSelectMetadata>;
  label?: string;
  defaultValue: string | undefined;
  onPersist: (value: number | null | string) => void;
  VariablePicker?: VariablePickerComponent;
};

const StyledDisplayModeContainer = styled.button`
  width: 100%;
  align-items: center;
  display: flex;
  cursor: pointer;
  border: none;
  background: transparent;
  font-family: inherit;
  padding-inline: ${({ theme }) => theme.spacing(2)};

  &:hover,
  &[data-open='true'] {
    background-color: ${({ theme }) => theme.background.transparent.lighter};
  }
`;

export const FormSelectFieldInput = ({
  label,
  field,
  defaultValue,
  onPersist,
  VariablePicker,
}: FormSelectFieldInputProps) => {
  const inputId = useId();

  const hotkeyScope = InlineCellHotkeyScope.InlineCell;

  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const [draftValue, setDraftValue] = useState<
    | {
        type: 'static';
        value: string;
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
          value: isDefined(defaultValue) ? String(defaultValue) : '',
          editingMode: 'view',
        },
  );

  const onSubmit = (option: string) => {
    setDraftValue({
      type: 'static',
      value: option,
      editingMode: 'view',
    });

    goBackToPreviousHotkeyScope();

    onPersist(option);
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

  const [filteredOptions, setFilteredOptions] = useState<SelectOption[]>([]);

  const { resetSelectedItem } = useSelectableList(
    SINGLE_RECORD_SELECT_BASE_LIST,
  );

  const clearField = () => {
    setDraftValue({
      type: 'static',
      editingMode: 'view',
      value: '',
    });

    onPersist(null);
  };

  const selectedOption = field.metadata.options.find(
    (option) => option.value === draftValue.value,
  );

  const handleClearField = () => {
    clearField();

    goBackToPreviousHotkeyScope();
  };

  const handleSubmit = (option: SelectOption) => {
    onSubmit(option.value);

    resetSelectedItem();
  };

  const handleUnlinkVariable = () => {
    setDraftValue({
      type: 'static',
      value: '',
      editingMode: 'view',
    });

    onPersist(null);
  };

  const handleVariableTagInsert = (variableName: string) => {
    setDraftValue({
      type: 'variable',
      value: variableName,
    });

    onPersist(variableName);
  };

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

  const handleSelectEnter = (itemId: string) => {
    const option = filteredOptions.find((option) => option.value === itemId);
    if (isDefined(option)) {
      onSubmit(option.value);
      resetSelectedItem();
    }
  };

  useScopedHotkeys(
    Key.Escape,
    () => {
      onCancel();
      resetSelectedItem();
    },
    hotkeyScope,
    [onCancel, resetSelectedItem],
  );

  const optionIds = [
    `No ${field.label}`,
    ...filteredOptions.map((option) => option.value),
  ];

  return (
    <StyledFormFieldInputContainer>
      {label ? <InputLabel>{label}</InputLabel> : null}

      <StyledFormFieldInputRowContainer>
        <StyledFormFieldInputInputContainer
          hasRightElement={isDefined(VariablePicker)}
        >
          {draftValue.type === 'static' ? (
            <>
              <StyledDisplayModeContainer
                data-open={draftValue.editingMode === 'edit'}
                onClick={handleDisplayModeClick}
              >
                <VisibilityHidden>Edit</VisibilityHidden>

                {isDefined(selectedOption) ? (
                  <SelectDisplay
                    color={selectedOption.color}
                    label={selectedOption.label}
                  />
                ) : null}
              </StyledDisplayModeContainer>

              {draftValue.editingMode === 'edit' ? (
                <SelectInput
                  selectableListId={SINGLE_RECORD_SELECT_BASE_LIST}
                  selectableItemIdArray={optionIds}
                  hotkeyScope={hotkeyScope}
                  onEnter={handleSelectEnter}
                  onOptionSelected={handleSubmit}
                  options={field.metadata.options}
                  onCancel={onCancel}
                  defaultOption={selectedOption}
                  onFilterChange={setFilteredOptions}
                  onClear={
                    field.metadata.isNullable ? handleClearField : undefined
                  }
                  clearLabel={field.label}
                />
              ) : null}
            </>
          ) : (
            <VariableChip
              rawVariableName={draftValue.value}
              onRemove={handleUnlinkVariable}
            />
          )}
        </StyledFormFieldInputInputContainer>

        {VariablePicker ? (
          <VariablePicker
            inputId={inputId}
            onVariableSelect={handleVariableTagInsert}
          />
        ) : null}
      </StyledFormFieldInputRowContainer>
    </StyledFormFieldInputContainer>
  );
};
