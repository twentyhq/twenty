import { t } from '@lingui/core/macro';
import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { VariableChipStandalone } from '@/object-record/record-field/ui/form-types/components/VariableChipStandalone';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
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

type FormNumberFieldInputValue =
  | {
      type: 'static';
      value: string;
    }
  | {
      type: 'variable';
      value: string;
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

  const draftValue: FormNumberFieldInputValue = isStandaloneVariableString(
    defaultValue,
  )
    ? {
        type: 'variable',
        value: defaultValue,
      }
    : {
        type: 'static',
        value: isDefined(defaultValue) ? String(defaultValue) : '',
      };

  const persistNumber = (newValue: string) => {
    if (!canBeCastAsNumberOrNull(newValue)) {
      setErrorMessage(t`Invalid number`);
      onError?.(t`Invalid number`);
      return;
    }

    setErrorMessage(undefined);
    onError?.(undefined);

    const castedValue = castAsNumberOrNull(newValue);

    onChange(castedValue);
  };

  const handleChange = (newText: string) => {
    persistNumber(newText.trim());
  };

  const handleUnlinkVariable = () => {
    onChange(null);
  };

  const handleVariableTagInsert = (variableName: string) => {
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
                  : t`Enter a number`
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
