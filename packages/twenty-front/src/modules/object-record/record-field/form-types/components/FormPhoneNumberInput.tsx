import { FormFieldInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputContainer';
import { FormFieldInputInnerContainer } from '@/object-record/record-field/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/form-types/components/FormFieldInputRowContainer';
import { VariableChipStandalone } from '@/object-record/record-field/form-types/components/VariableChipStandalone';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { TextInput } from '@/ui/field/input/components/TextInput';
import { InputHint } from '@/ui/input/components/InputHint';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';
import styled from '@emotion/styled';
import isEmpty from 'lodash.isempty';
import { useId, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

const StyledInput = styled(TextInput)`
  padding: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(2)}`};
`;

type FormPhoneNumberInputProps = {
  label?: string;
  defaultValue: string | undefined;
  onChange: (value: string | null) => void;
  onBlur?: () => void;
  VariablePicker?: VariablePickerComponent;
  hint?: string;
  readonly?: boolean;
  placeholder?: string;
  error?: string;
  onError?: (error: string | undefined) => void;
};

// Phone number validation that allows digits, spaces, hyphens, parentheses, plus sign, comma, and pound sign
const isValidPhoneNumberInput = (value: string): boolean => {
  // Allow empty string
  if (value === '') return true;
  
  // Allow only digits, spaces, hyphens, parentheses, plus sign, comma, and pound sign
  const phoneNumberPattern = /^[\d\s\-\(\)\+\,\#]*$/;
  return phoneNumberPattern.test(value);
};

export const FormPhoneNumberInput = ({
  label,
  placeholder,
  defaultValue,
  onChange,
  onError,
  onBlur,
  VariablePicker,
  hint,
  readonly,
  error: errorFromProps,
}: FormPhoneNumberInputProps) => {
  const inputId = useId();
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  );

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
          value: defaultValue ?? '',
        },
  );

  const persistPhoneNumber = (newValue: string) => {
    if (!isValidPhoneNumberInput(newValue)) {
      setErrorMessage('Invalid phone number format');
      onError?.('Invalid phone number format');
      return;
    }

    setErrorMessage(undefined);
    onError?.(undefined);

    onChange(newValue || null);
  };

  const handleChange = (newText: string) => {
    setDraftValue({
      type: 'static',
      value: newText,
    });

    persistPhoneNumber(newText.trim());
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

  const error = errorMessage ?? errorFromProps;

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
              placeholder={
                isDefined(placeholder) && !isEmpty(placeholder)
                  ? placeholder
                  : 'Enter phone number'
              }
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
      {error && <InputHint danger>{error}</InputHint>}
    </FormFieldInputContainer>
  );
};