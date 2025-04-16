import { FormFieldInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputContainer';
import { FormFieldInputInnerContainer } from '@/object-record/record-field/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/form-types/components/FormFieldInputRowContainer';
import { VariableChipStandalone } from '@/object-record/record-field/form-types/components/VariableChipStandalone';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { TextInput } from '@/ui/field/input/components/TextInput';
import { InputErrorHelper } from '@/ui/input/components/InputErrorHelper';
import { InputHint } from '@/ui/input/components/InputHint';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';
import styled from '@emotion/styled';
import { useId, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  canBeCastAsNumberOrNull,
  castAsNumberOrNull,
} from '~/utils/cast-as-number-or-null';

const StyledInput = styled(TextInput)`
  padding: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(2)}`};
`;

type FormNumberFieldInputProps = {
  label?: string;
  error?: string;
  defaultValue: number | string | undefined;
  onChange: (value: number | null | string) => void;
  onBlur?: () => void;
  VariablePicker?: VariablePickerComponent;
  hint?: string;
  readonly?: boolean;
  placeholder?: string;
};

export const FormNumberFieldInput = ({
  label,
  error,
  placeholder,
  defaultValue,
  onChange,
  onBlur,
  VariablePicker,
  hint,
  readonly,
}: FormNumberFieldInputProps) => {
  const inputId = useId();

  const [draftValue, setDraftValue] = useState<
    | {
        type: 'static';
        value: string;
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
        },
  );

  const persistNumber = (newValue: string) => {
    if (!canBeCastAsNumberOrNull(newValue)) {
      return;
    }

    const castedValue = castAsNumberOrNull(newValue);

    onChange(castedValue);
  };

  const handleChange = (newText: string) => {
    setDraftValue({
      type: 'static',
      value: newText,
    });

    persistNumber(newText.trim());
  };

  const handleUnlinkVariable = () => {
    setDraftValue({
      type: 'static',
      value: '',
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

  return (
    <FormFieldInputContainer>
      {label ? <InputLabel htmlFor={inputId}>{label}</InputLabel> : null}

      <FormFieldInputRowContainer>
        <FormFieldInputInnerContainer
          hasRightElement={isDefined(VariablePicker) && !readonly}
          onBlur={onBlur}
        >
          {draftValue.type === 'static' ? (
            <StyledInput
              inputId={inputId}
              placeholder={placeholder ?? 'Enter a number'}
              value={draftValue.value}
              copyButton={false}
              hotkeyScope="record-create"
              onChange={handleChange}
              disabled={readonly}
            />
          ) : (
            <VariableChipStandalone
              rawVariableName={draftValue.value}
              onRemove={readonly ? undefined : handleUnlinkVariable}
            />
          )}
        </FormFieldInputInnerContainer>

        {VariablePicker && !readonly ? (
          <VariablePicker
            inputId={inputId}
            onVariableSelect={handleVariableTagInsert}
          />
        ) : null}
      </FormFieldInputRowContainer>

      {hint ? <InputHint>{hint}</InputHint> : null}
      <InputErrorHelper>{error}</InputErrorHelper>
    </FormFieldInputContainer>
  );
};
