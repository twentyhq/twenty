import { t } from '@lingui/core/macro';
import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { VariableChipStandalone } from '@/object-record/record-field/ui/form-types/components/VariableChipStandalone';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { TextInput } from '@/ui/field/input/components/TextInput';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';
import styled from '@emotion/styled';
import { useId, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

const StyledInput = styled(TextInput)`
  padding: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(2)}`};
`;

type FormUuidFieldInputProps = {
  label?: string;
  defaultValue: string | null | undefined;
  onChange: (value: string | null) => void;
  readonly?: boolean;
  VariablePicker?: VariablePickerComponent;
  placeholder?: string;
};

export const FormUuidFieldInput = ({
  label,
  defaultValue,
  placeholder,
  onChange,
  readonly,
  VariablePicker,
}: FormUuidFieldInputProps) => {
  const instanceId = useId();

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

  const handleChange = (newText: string) => {
    setDraftValue({
      type: 'static',
      value: newText,
    });

    const trimmedNewText = newText.trim();

    if (trimmedNewText === '') {
      onChange(null);

      return;
    }

    onChange(trimmedNewText);
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
      {label ? <InputLabel htmlFor={instanceId}>{label}</InputLabel> : null}

      <FormFieldInputRowContainer>
        <FormFieldInputInnerContainer
          formFieldInputInstanceId={instanceId}
          hasRightElement={isDefined(VariablePicker) && !readonly}
        >
          {draftValue.type === 'static' ? (
            <StyledInput
              instanceId={instanceId}
              placeholder={placeholder ?? t`Enter a UUID`}
              value={draftValue.value}
              copyButton={false}
              disabled={readonly}
              onChange={handleChange}
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
    </FormFieldInputContainer>
  );
};
