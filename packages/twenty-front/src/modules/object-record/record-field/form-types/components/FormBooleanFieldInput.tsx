import { StyledFormFieldInputContainer } from '@/object-record/record-field/form-types/components/StyledFormFieldInputContainer';
import { StyledFormFieldInputInputContainer } from '@/object-record/record-field/form-types/components/StyledFormFieldInputInputContainer';
import { StyledFormFieldInputRowContainer } from '@/object-record/record-field/form-types/components/StyledFormFieldInputRowContainer';
import { VariableChip } from '@/object-record/record-field/form-types/components/VariableChip';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { BooleanInput } from '@/ui/field/input/components/BooleanInput';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';
import styled from '@emotion/styled';
import { useId, useState } from 'react';
import { isDefined } from 'twenty-ui';

const StyledBooleanInputContainer = styled.div`
  padding-inline: ${({ theme }) => theme.spacing(2)};
`;

type FormBooleanFieldInputProps = {
  label?: string;
  defaultValue: boolean | string | undefined;
  onPersist: (value: boolean | null | string) => void;
  VariablePicker?: VariablePickerComponent;
  readonly?: boolean;
};

export const FormBooleanFieldInput = ({
  label,
  defaultValue,
  onPersist,
  readonly,
  VariablePicker,
}: FormBooleanFieldInputProps) => {
  const inputId = useId();

  const [draftValue, setDraftValue] = useState<
    | {
        type: 'static';
        value: boolean;
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
          value: defaultValue ?? false,
        },
  );

  const handleChange = (newValue: boolean) => {
    setDraftValue({
      type: 'static',
      value: newValue,
    });

    onPersist(newValue);
  };

  const handleVariableTagInsert = (variableName: string) => {
    setDraftValue({
      type: 'variable',
      value: variableName,
    });

    onPersist(variableName);
  };

  const handleUnlinkVariable = () => {
    setDraftValue({
      type: 'static',
      value: false,
    });

    onPersist(false);
  };

  return (
    <StyledFormFieldInputContainer>
      {label ? <InputLabel>{label}</InputLabel> : null}

      <StyledFormFieldInputRowContainer>
        <StyledFormFieldInputInputContainer
          hasRightElement={isDefined(VariablePicker)}
        >
          {draftValue.type === 'static' ? (
            <StyledBooleanInputContainer>
              <BooleanInput
                value={draftValue.value}
                readonly={readonly}
                onToggle={handleChange}
              />
            </StyledBooleanInputContainer>
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
