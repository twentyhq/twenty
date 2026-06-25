import { t } from '@lingui/core/macro';
import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { VariableChipStandalone } from '@/object-record/record-field/ui/form-types/components/VariableChipStandalone';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { InputHint, InputLabel, type SelectOption } from 'twenty-ui/input';
import { type CallToActionButton, Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';
import { useContext, useId, useState } from 'react';
import { Key } from 'ts-key-enum';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { IconCircleOff } from 'twenty-ui/icon';
import { ThemeContext } from 'twenty-ui/theme-constants';

type FormSelectFieldInputProps = {
  label?: string;
  hint?: string;
  defaultValue: string | undefined;
  onChange: (value: string | null) => void;
  VariablePicker?: VariablePickerComponent;
  options: SelectOption[];
  readonly?: boolean;
  isNullable?: boolean;
  callToActionButton?: CallToActionButton;
};

export const FormSelectFieldInput = ({
  label,
  hint,
  defaultValue,
  onChange,
  VariablePicker,
  options,
  readonly,
  isNullable,
  callToActionButton,
}: FormSelectFieldInputProps) => {
  const { theme } = useContext(ThemeContext);
  const instanceId = useId();

  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

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

  const onSelect = (selectedValue: string) => {
    setDraftValue({
      type: 'static',
      value: selectedValue,
      editingMode: 'view',
    });

    removeFocusItemFromFocusStackById({ focusId: instanceId });

    onChange(isNonEmptyString(selectedValue) ? selectedValue : null);
  };

  const onCancel = () => {
    if (draftValue.type !== 'static') {
      throw new Error('Can only be called when editing a static value');
    }

    setDraftValue({
      ...draftValue,
      editingMode: 'view',
    });

    removeFocusItemFromFocusStackById({ focusId: instanceId });
  };

  const emptyOption: SelectOption = {
    label: label ? t`No ${label}` : t`No value`,
    value: '',
    Icon: IconCircleOff,
  };

  const optionsWithEmptyOption = isNullable
    ? [emptyOption, ...options]
    : options;

  const selectedOption = optionsWithEmptyOption.find(
    (option) => option.value === draftValue.value,
  );

  const handleUnlinkVariable = () => {
    setDraftValue({
      type: 'static',
      value: '',
      editingMode: 'view',
    });

    onChange(null);
  };

  const handleVariableTagInsert = (variableName: string) => {
    setDraftValue({
      type: 'variable',
      value: variableName,
    });

    onChange(variableName);
  };

  useHotkeysOnFocusedElement({
    keys: Key.Escape,
    callback: onCancel,
    focusId: instanceId,
    dependencies: [onCancel],
  });

  return (
    <FormFieldInputContainer>
      {label ? <InputLabel>{label}</InputLabel> : null}

      <FormFieldInputRowContainer>
        {draftValue.type === 'static' ? (
          <Select
            dropdownId={`${instanceId}-select-display`}
            options={optionsWithEmptyOption}
            value={selectedOption?.value}
            onChange={onSelect}
            callToActionButton={callToActionButton}
            fullWidth
            hasRightElement={isDefined(VariablePicker) && !readonly}
            withSearchInput
            disabled={readonly}
            dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
            dropdownOffset={{
              y: parseInt(theme.spacing[1], 10),
            }}
          />
        ) : (
          <FormFieldInputInnerContainer
            formFieldInputInstanceId={instanceId}
            hasRightElement={isDefined(VariablePicker) && !readonly}
          >
            <VariableChipStandalone
              rawVariableName={draftValue.value}
              onRemove={readonly ? undefined : handleUnlinkVariable}
            />
          </FormFieldInputInnerContainer>
        )}

        {isDefined(VariablePicker) && !readonly && (
          <VariablePicker
            instanceId={instanceId}
            onVariableSelect={handleVariableTagInsert}
          />
        )}
      </FormFieldInputRowContainer>
      {hint && <InputHint>{hint}</InputHint>}
    </FormFieldInputContainer>
  );
};
