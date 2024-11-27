import {
  StyledContainer,
  StyledInputContainer,
  StyledRowContainer,
} from '@/object-record/record-field/form-types/components/FormFieldInputBase';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { TextInput } from '@/ui/field/input/components/TextInput';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { StyledVariableContainer } from '@/workflow/components/WorkflowFormFieldInputBase';
import { extractVariableLabel } from '@/workflow/search-variables/utils/extractVariableLabel';
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

type EditingMode = 'input' | 'variable';

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

  const [draftValue, setDraftValue] = useState(defaultValue ?? '');

  const defaultEditingMode = isStandaloneVariableString(defaultValue)
    ? 'variable'
    : 'input';
  const [editingMode, setEditingMode] =
    useState<EditingMode>(defaultEditingMode);

  const persistNumber = (newValue: string) => {
    if (!canBeCastAsNumberOrNull(newValue)) {
      return;
    }

    const castedValue = castAsNumberOrNull(newValue);

    onPersist(castedValue);
  };

  const handleChange = (newText: string) => {
    setDraftValue(newText);

    persistNumber(newText.trim());
  };

  const handleUnlinkVariable = () => {
    setEditingMode('input');
    setDraftValue('');

    onPersist(null);
  };

  const handleVariableTagInsert = (variable: string) => {
    setEditingMode('variable');
    setDraftValue(variable);

    onPersist(variable);
  };

  return (
    <StyledContainer>
      {label ? <InputLabel htmlFor={inputId}>{label}</InputLabel> : null}

      <StyledRowContainer>
        <StyledInputContainer hasRightElement={isDefined(VariablePicker)}>
          {editingMode === 'input' ? (
            <StyledInput
              inputId={inputId}
              placeholder={placeholder}
              value={String(draftValue)}
              copyButton={false}
              hotkeyScope="record-create"
              onChange={handleChange}
            />
          ) : (
            <StyledVariableContainer>
              <SortOrFilterChip
                labelValue={extractVariableLabel(draftValue as string)}
                onRemove={handleUnlinkVariable}
              />
            </StyledVariableContainer>
          )}
        </StyledInputContainer>

        {VariablePicker ? (
          <VariablePicker
            inputId={inputId}
            onVariableSelect={handleVariableTagInsert}
          />
        ) : null}
      </StyledRowContainer>
    </StyledContainer>
  );
};
