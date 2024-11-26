import {
  StyledContainer,
  StyledInputContainer,
  StyledRowContainer,
} from '@/object-record/record-field/form-types/components/FormFieldInputBase';
import { TextInput } from '@/ui/field/input/components/TextInput';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import {
  StyledSearchVariablesDropdownContainer,
  StyledVariableContainer,
} from '@/workflow/components/WorkflowFormFieldInputBase';
import SearchVariablesDropdown from '@/workflow/search-variables/components/SearchVariablesDropdown';
import { extractVariableLabel } from '@/workflow/search-variables/utils/extractVariableLabel';
import styled from '@emotion/styled';
import { isString } from '@sniptt/guards';
import { useId, useState } from 'react';
import {
  canBeCastAsNumberOrNull,
  castAsNumberOrNull,
} from '~/utils/cast-as-number-or-null';

const StyledInput = styled(TextInput)`
  padding: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(2)}`};
`;

type EditingMode = 'input' | 'variable';

type WorkflowFormNumberFieldInputProps = {
  label?: string;
  placeholder: string;
  defaultValue: number | string | undefined;
  onPersist: (value: number | null | string) => void;
};

export const WorkflowFormNumberFieldInput = ({
  label,
  placeholder,
  defaultValue,
  onPersist,
}: WorkflowFormNumberFieldInputProps) => {
  const inputId = useId();
  const variablesDropdownId = useId();

  const [draftValue, setDraftValue] = useState(defaultValue ?? '');

  const defaultEditingMode =
    isString(defaultValue) && defaultValue.startsWith('{{')
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
        <StyledInputContainer hasRightElement>
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

        <StyledSearchVariablesDropdownContainer readonly={false}>
          <SearchVariablesDropdown
            inputId={variablesDropdownId}
            onVariableSelect={handleVariableTagInsert}
            disabled={false}
          />
        </StyledSearchVariablesDropdownContainer>
      </StyledRowContainer>
    </StyledContainer>
  );
};
