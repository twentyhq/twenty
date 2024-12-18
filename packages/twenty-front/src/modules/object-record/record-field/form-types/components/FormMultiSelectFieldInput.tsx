import styled from '@emotion/styled';

import { FormFieldInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputContainer';
import { FormFieldInputInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputInputContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/form-types/components/FormFieldInputRowContainer';
import { VariableChip } from '@/object-record/record-field/form-types/components/VariableChip';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { FieldMultiSelectValue } from '@/object-record/record-field/types/FieldMetadata';
import { MULTI_OBJECT_RECORD_SELECT_SELECTABLE_LIST_ID } from '@/object-record/relation-picker/constants/MultiObjectRecordSelectSelectableListId';
import { SelectOption } from '@/spreadsheet-import/types';
import { MultiSelectDisplay } from '@/ui/field/display/components/MultiSelectDisplay';
import { MultiSelectInput } from '@/ui/field/input/components/MultiSelectInput';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';
import { useId, useState } from 'react';
import { VisibilityHidden } from 'twenty-ui';
import { isDefined } from '~/utils/isDefined';

type FormMultiSelectFieldInputProps = {
  label?: string;
  defaultValue: FieldMultiSelectValue | string | undefined;
  options: SelectOption[];
  onPersist: (value: FieldMultiSelectValue | string) => void;
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

const StyledSelectInputContainer = styled.div`
  position: absolute;
  z-index: 1;
  top: ${({ theme }) => theme.spacing(8)};
`;

export const FormMultiSelectFieldInput = ({
  label,
  defaultValue,
  options,
  onPersist,
  VariablePicker,
}: FormMultiSelectFieldInputProps) => {
  const inputId = useId();

  const hotkeyScope = MULTI_OBJECT_RECORD_SELECT_SELECTABLE_LIST_ID;

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

    onPersist(value);
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

    onPersist(variableName);
  };

  const handleUnlinkVariable = () => {
    setDraftValue({
      type: 'static',
      value: [],
      editingMode: 'view',
    });

    onPersist([]);
  };

  const selectedNames =
    draftValue.type === 'static' ? draftValue.value : undefined;

  const selectedOptions =
    isDefined(selectedNames) && isDefined(options)
      ? options.filter((option) =>
          selectedNames.some((name) => option.value === name),
        )
      : undefined;

  return (
    <FormFieldInputContainer>
      {label ? <InputLabel>{label}</InputLabel> : null}

      <FormFieldInputRowContainer>
        <FormFieldInputInputContainer
          hasRightElement={isDefined(VariablePicker)}
        >
          {draftValue.type === 'static' ? (
            <StyledDisplayModeContainer
              data-open={draftValue.editingMode === 'edit'}
              onClick={handleDisplayModeClick}
            >
              <VisibilityHidden>Edit</VisibilityHidden>

              {isDefined(selectedOptions) ? (
                <MultiSelectDisplay
                  values={selectedNames}
                  options={selectedOptions}
                />
              ) : null}
            </StyledDisplayModeContainer>
          ) : (
            <VariableChip
              rawVariableName={draftValue.value}
              onRemove={handleUnlinkVariable}
            />
          )}
        </FormFieldInputInputContainer>
        <StyledSelectInputContainer>
          {draftValue.type === 'static' &&
            draftValue.editingMode === 'edit' && (
              <OverlayContainer>
                <MultiSelectInput
                  hotkeyScope={hotkeyScope}
                  options={options}
                  onCancel={onCancel}
                  onOptionSelected={onOptionSelected}
                  values={draftValue.value}
                />
              </OverlayContainer>
            )}
        </StyledSelectInputContainer>

        {VariablePicker && (
          <VariablePicker
            inputId={inputId}
            onVariableSelect={handleVariableTagInsert}
          />
        )}
      </FormFieldInputRowContainer>
    </FormFieldInputContainer>
  );
};
