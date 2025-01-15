import { FormFieldInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputContainer';
import { FormFieldInputInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputInputContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/form-types/components/FormFieldInputRowContainer';
import { VariableChip } from '@/object-record/record-field/form-types/components/VariableChip';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { InlineCellHotkeyScope } from '@/object-record/record-inline-cell/types/InlineCellHotkeyScope';
import { SINGLE_RECORD_SELECT_BASE_LIST } from '@/object-record/relation-picker/constants/SingleRecordSelectBaseList';
import { SelectOption } from '@/spreadsheet-import/types';
import { SelectDisplay } from '@/ui/field/display/components/SelectDisplay';
import { SelectInput } from '@/ui/field/input/components/SelectInput';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useId, useState } from 'react';
import { Key } from 'ts-key-enum';
import { IconChevronDown, isDefined, VisibilityHidden } from 'twenty-ui';

type FormSelectFieldInputProps = {
  label?: string;
  defaultValue: string | undefined;
  onPersist: (value: string | null) => void;
  VariablePicker?: VariablePickerComponent;
  options: SelectOption[];
  clearLabel?: string;
  readonly?: boolean;
  preventDisplayPadding?: boolean;
  placeholder?: string;
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

const StyledPlaceholder = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  width: 100%;
`;

const StyledSelectInputContainer = styled.div`
  position: absolute;
  z-index: 1;
  top: ${({ theme }) => theme.spacing(8)};
`;

const StyledSelectDisplayContainer = styled.div`
  display: flex;
  width: 100%;
`;

export const FormSelectFieldInput = ({
  label,
  defaultValue,
  onPersist,
  VariablePicker,
  options,
  clearLabel,
  readonly,
  preventDisplayPadding,
  placeholder,
}: FormSelectFieldInputProps) => {
  const inputId = useId();

  const hotkeyScope = InlineCellHotkeyScope.InlineCell;
  const theme = useTheme();

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

  const selectedOption = options.find(
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
    `No ${label}`,
    ...filteredOptions.map((option) => option.value),
  ];

  const placeholderText = placeholder ?? label;

  return (
    <FormFieldInputContainer>
      {label ? <InputLabel>{label}</InputLabel> : null}

      <FormFieldInputRowContainer>
        <FormFieldInputInputContainer
          hasRightElement={isDefined(VariablePicker) && !readonly}
        >
          {draftValue.type === 'static' ? (
            readonly ? (
              <StyledDisplayModeReadonlyContainer>
                {isDefined(selectedOption) ? (
                  <StyledSelectDisplayContainer>
                    <SelectDisplay
                      color={selectedOption.color ?? 'transparent'}
                      label={selectedOption.label}
                      Icon={selectedOption.icon ?? undefined}
                      preventPadding={preventDisplayPadding}
                    />
                  </StyledSelectDisplayContainer>
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

                {isDefined(selectedOption) ? (
                  <StyledSelectDisplayContainer>
                    <SelectDisplay
                      color={selectedOption.color ?? 'transparent'}
                      label={selectedOption.label}
                      Icon={selectedOption.icon ?? undefined}
                      preventPadding={preventDisplayPadding}
                    />
                  </StyledSelectDisplayContainer>
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
            <VariableChip
              rawVariableName={draftValue.value}
              onRemove={readonly ? undefined : handleUnlinkVariable}
            />
          )}
        </FormFieldInputInputContainer>
        <StyledSelectInputContainer>
          {!readonly &&
            draftValue.type === 'static' &&
            draftValue.editingMode === 'edit' && (
              <OverlayContainer>
                <SelectInput
                  selectableListId={SINGLE_RECORD_SELECT_BASE_LIST}
                  selectableItemIdArray={optionIds}
                  hotkeyScope={hotkeyScope}
                  onEnter={handleSelectEnter}
                  onOptionSelected={handleSubmit}
                  options={options}
                  onCancel={onCancel}
                  defaultOption={selectedOption}
                  onFilterChange={setFilteredOptions}
                  onClear={handleClearField}
                  clearLabel={clearLabel}
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
