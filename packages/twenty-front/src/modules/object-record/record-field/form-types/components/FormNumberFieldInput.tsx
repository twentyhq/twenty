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
import {
  canBeCastAsNumberOrNull,
  castAsNumberOrNull,
} from '~/utils/cast-as-number-or-null';

const StyledInput = styled(TextInput)`
  padding: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(2)}`};
`;

type FormNumberFieldInputProps = {
  label?: string;
  defaultValue: number | string | undefined;
  onChange: (value: number | null | string) => void;
  onBlur?: () => void;
  VariablePicker?: VariablePickerComponent;
  hint?: string;
  readonly?: boolean;
  placeholder?: string;
  error?: string;
  onError?: (error: string | undefined) => void;
};

export const FormNumberFieldInput = ({
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
}: FormNumberFieldInputProps) => {
  const instanceId = useId();
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
          value: isDefined(defaultValue) ? String(defaultValue) : '',
        },
  );

  const persistNumber = (newValue: string) => {
    if (!canBeCastAsNumberOrNull(newValue)) {
      setErrorMessage('Invalid number');
      onError?.('Invalid number');
      return;
    }

    setErrorMessage(undefined);
    onError?.(undefined);

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

  const error = errorMessage ?? errorFromProps;

  return (
    <FormFieldInputContainer>
      {label ? <InputLabel htmlFor={instanceId}>{label}</InputLabel> : null}

      <FormFieldInputRowContainer>
        <FormFieldInputInnerContainer
          formFieldInputInstanceId={instanceId}
          hasRightElement={isDefined(VariablePicker) && !readonly}
          onBlur={onBlur}
        >
          {draftValue.type === 'static' ? (
            <StyledInput
              instanceId={instanceId}
              placeholder={
                isDefined(placeholder) && !isEmpty(placeholder)
                  ? placeholder
                  : 'Enter a number'
              }
              value={draftValue.value}
              copyButton={false}
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
            instanceId={instanceId}
            onVariableSelect={handleVariableTagInsert}
          />
        ) : null}
      </FormFieldInputRowContainer>

      {hint ? <InputHint>{hint}</InputHint> : null}
      {error && <InputHint danger>{error}</InputHint>}
    </FormFieldInputContainer>
  );
};
