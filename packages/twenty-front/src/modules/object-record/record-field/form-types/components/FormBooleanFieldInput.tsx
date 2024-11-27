import { SelectedVariableChip } from '@/object-record/record-field/form-types/components/SelectedVariableChip';
import { StyledFormFieldInputContainer } from '@/object-record/record-field/form-types/components/StyledFormFieldInputContainer';
import { StyledFormFieldInputInputContainer } from '@/object-record/record-field/form-types/components/StyledFormFieldInputInputContainer';
import { StyledFormFieldInputRowContainer } from '@/object-record/record-field/form-types/components/StyledFormFieldInputRowContainer';
import { EditingMode } from '@/object-record/record-field/form-types/types/EditingMode';
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

  const defaultEditingMode = isStandaloneVariableString(defaultValue)
    ? 'variable'
    : 'input';
  const [editingMode, setEditingMode] =
    useState<EditingMode>(defaultEditingMode);

  const [draftValue, setDraftValue] = useState(defaultValue ?? false);

  const handleChange = (newValue: boolean) => {
    setDraftValue(newValue);

    onPersist(newValue);
  };

  const handleVariableTagInsert = (variable: string) => {
    setEditingMode('variable');
    setDraftValue(variable);

    onPersist(variable);
  };

  const handleUnlinkVariable = () => {
    setEditingMode('input');
    setDraftValue(false);

    onPersist(false);
  };

  return (
    <StyledFormFieldInputContainer>
      {label ? <InputLabel>{label}</InputLabel> : null}

      <StyledFormFieldInputRowContainer>
        <StyledFormFieldInputInputContainer
          hasRightElement={isDefined(VariablePicker)}
        >
          {editingMode === 'input' ? (
            <StyledBooleanInputContainer>
              <BooleanInput
                value={draftValue as boolean}
                readonly={readonly}
                onToggle={handleChange}
              />
            </StyledBooleanInputContainer>
          ) : (
            <SelectedVariableChip
              rawVariable={draftValue as string}
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
