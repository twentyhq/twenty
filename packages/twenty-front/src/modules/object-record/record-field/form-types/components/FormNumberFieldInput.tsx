import { StyledFormFieldInputContainer } from '@/object-record/record-field/form-types/components/StyledFormFieldInputContainer';
import { StyledFormFieldInputInputContainer } from '@/object-record/record-field/form-types/components/StyledFormFieldInputInputContainer';
import { StyledFormFieldInputRowContainer } from '@/object-record/record-field/form-types/components/StyledFormFieldInputRowContainer';
import { VariableChip } from '@/object-record/record-field/form-types/components/VariableChip';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { TextInput } from '@/ui/field/input/components/TextInput';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';
import styled from '@emotion/styled';
import { useId, useState } from 'react';
import { isDefined } from 'twenty-ui';
import {
  canBeCastAsNumberOrNull,
  castAsNumberOrNull,
} from '~/utils/cast-as-number-or-null';

const StyledInput = styled(TextInput)`
  padding: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(2)}`};
`;

type FormNumberFieldInputProps = {
  label?: string;
  placeholder: string;
  defaultValue: number | string | undefined;
  onPersist: (value: number | null | string) => void;
  VariablePicker?: VariablePickerComponent;
};

export const FormNumberFieldInput = ({
  label,
  placeholder,
  defaultValue,
  onPersist,
  VariablePicker,
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

    onPersist(castedValue);
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

    onPersist(null);
  };

  const handleVariableTagInsert = (variableName: string) => {
    setDraftValue({
      type: 'variable',
      value: variableName,
    });

    onPersist(variableName);
  };

  return (
    <StyledFormFieldInputContainer>
      {label ? <InputLabel htmlFor={inputId}>{label}</InputLabel> : null}

      <StyledFormFieldInputRowContainer>
        <StyledFormFieldInputInputContainer
          hasRightElement={isDefined(VariablePicker)}
        >
          {draftValue.type === 'static' ? (
            <StyledInput
              inputId={inputId}
              placeholder={placeholder}
              value={draftValue.value}
              copyButton={false}
              hotkeyScope="record-create"
              onChange={handleChange}
            />
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
