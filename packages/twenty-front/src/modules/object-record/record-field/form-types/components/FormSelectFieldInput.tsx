import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { StyledFormFieldInputContainer } from '@/object-record/record-field/form-types/components/StyledFormFieldInputContainer';
import { StyledFormFieldInputInputContainer } from '@/object-record/record-field/form-types/components/StyledFormFieldInputInputContainer';
import { StyledFormFieldInputRowContainer } from '@/object-record/record-field/form-types/components/StyledFormFieldInputRowContainer';
import { VariableChip } from '@/object-record/record-field/form-types/components/VariableChip';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { SINGLE_RECORD_SELECT_BASE_LIST } from '@/object-record/relation-picker/constants/SingleRecordSelectBaseList';
import { SelectOption } from '@/spreadsheet-import/types';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { SelectInput } from '@/ui/input/components/SelectInput';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';
import { useId, useState } from 'react';
import { isDefined, Tag, TagColor } from 'twenty-ui';

type FormSelectFieldInputProps = {
  field: ObjectMetadataItem & {
    options: { label: string; value: string; color: TagColor }[];
  };
  label?: string;
  defaultValue: string | undefined;
  onPersist: (value: number | null | string) => void;
  VariablePicker?: VariablePickerComponent;
};

export const FormSelectFieldInput = ({
  label,
  field,
  defaultValue,
  onPersist,
  VariablePicker,
}: FormSelectFieldInputProps) => {
  const inputId = useId();

  console.log('field in Form Field Select', field);

  const onSubmit = (option: string) => {
    setDraftValue({
      type: 'static',
      value: option,
      editingMode: 'view',
    });

    onPersist(option);
  };
  const onCancel = (...args) => {
    console.log(args);
  };

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

  const [selectWrapperRef, setSelectWrapperRef] =
    useState<HTMLDivElement | null>(null);

  const [filteredOptions, setFilteredOptions] = useState<SelectOption[]>([]);

  const { resetSelectedItem } = useSelectableList(
    SINGLE_RECORD_SELECT_BASE_LIST,
  );
  const clearField = () => {
    console.log('calling clearField');
  };

  const selectedOption = field.options.find(
    (option) => option.value === draftValue.value,
  );
  // handlers
  const handleClearField = () => {
    clearField();
    onCancel?.();
  };

  const handleSubmit = (option: SelectOption) => {
    onSubmit?.(option?.value);

    resetSelectedItem();
  };

  const hotkeyScope = 'workflow form';

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

  //   useScopedHotkeys(
  //     Key.Escape,
  //     () => {
  //       onCancel?.();
  //       resetSelectedItem();
  //     },
  //     hotkeyScope,
  //     [onCancel, resetSelectedItem],
  //   );

  const optionIds = [
    `No ${field.labelSingular}`,
    ...filteredOptions.map((option) => option.value),
  ];

  return (
    <StyledFormFieldInputContainer>
      {label ? <InputLabel>{label}</InputLabel> : null}

      <StyledFormFieldInputRowContainer>
        <StyledFormFieldInputInputContainer
          ref={setSelectWrapperRef}
          hasRightElement={isDefined(VariablePicker)}
        >
          {draftValue.type === 'static' ? (
            <>
              <div
                style={{ width: '100%' }}
                onClick={() => {
                  setDraftValue({
                    ...draftValue,
                    editingMode: 'edit',
                  });
                }}
              >
                {isDefined(selectedOption) ? (
                  <Tag
                    preventShrink
                    color={selectedOption!.color}
                    text={selectedOption!.label}
                  />
                ) : null}
              </div>

              {draftValue.editingMode === 'edit' ? (
                <SelectableList
                  selectableListId={SINGLE_RECORD_SELECT_BASE_LIST}
                  selectableItemIdArray={optionIds}
                  hotkeyScope={hotkeyScope}
                  onEnter={(itemId) => {
                    const option = filteredOptions.find(
                      (option) => option.value === itemId,
                    );
                    if (isDefined(option)) {
                      onSubmit?.(option.value);
                      resetSelectedItem();
                    }
                  }}
                >
                  <SelectInput
                    parentRef={selectWrapperRef}
                    onOptionSelected={handleSubmit}
                    options={field.options}
                    onCancel={onCancel}
                    defaultOption={selectedOption}
                    onFilterChange={setFilteredOptions}
                    onClear={true ? handleClearField : undefined}
                    clearLabel={field.labelSingular}
                    hotkeyScope={hotkeyScope}
                  />
                </SelectableList>
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
