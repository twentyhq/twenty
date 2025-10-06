import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { VariableChipStandalone } from '@/object-record/record-field/ui/form-types/components/VariableChipStandalone';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';
import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { useId, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconCheck, IconCircleOff, IconX } from 'twenty-ui/display';

type FormBooleanFieldInputProps = {
  label?: string;
  defaultValue: boolean | string | undefined;
  onChange: (value: boolean | null | string) => void;
  VariablePicker?: VariablePickerComponent;
  readonly?: boolean;
};

const parseStringifiedBooleanToBoolean = (value: string) => {
  if (value === 'true') {
    return true;
  }

  return false;
};

const castBooleanToStringifiedBoolean = (value: boolean | undefined) => {
  if (value === undefined) {
    return '';
  }

  return value ? 'true' : 'false';
};

export const FormBooleanFieldInput = ({
  label,
  defaultValue,
  onChange,
  readonly,
  VariablePicker,
}: FormBooleanFieldInputProps) => {
  const theme = useTheme();
  const { t } = useLingui();

  const instanceId = useId();

  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const [draftValue, setDraftValue] = useState<
    | {
        type: 'static';
        value: boolean | undefined;
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
          value: defaultValue,
          editingMode: 'view',
        },
  );

  const defaultEmptyOption = {
    label: t`Select a value`,
    value: '',
    icon: IconCircleOff,
  };

  const onSelect = (option: string) => {
    const optionAsBoolean = parseStringifiedBooleanToBoolean(option);

    setDraftValue({
      type: 'static',
      value: optionAsBoolean,
      editingMode: 'view',
    });

    removeFocusItemFromFocusStackById({ focusId: instanceId });

    onChange(optionAsBoolean);
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
      value: false,
      editingMode: 'view',
    });

    onChange(false);
  };

  return (
    <FormFieldInputContainer>
      {label ? <InputLabel>{label}</InputLabel> : null}

      <FormFieldInputRowContainer>
        {draftValue.type === 'static' ? (
          <Select
            dropdownId={`${instanceId}-select-display`}
            options={[
              { label: 'True', value: 'true', Icon: IconCheck },
              { label: 'False', value: 'false', Icon: IconX },
            ]}
            value={castBooleanToStringifiedBoolean(draftValue.value)}
            onChange={onSelect}
            emptyOption={defaultEmptyOption}
            fullWidth
            hasRightElement={isDefined(VariablePicker) && !readonly}
            disabled={readonly}
            dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
            dropdownOffset={{ y: parseInt(theme.spacing(1), 10) }}
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
    </FormFieldInputContainer>
  );
};
