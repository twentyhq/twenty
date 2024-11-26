import {
  StyledContainer,
  StyledInputContainer,
  StyledRowContainer,
} from '@/object-record/record-field/form-types/components/FormFieldInputBase';
import { BooleanInput } from '@/ui/field/input/components/BooleanInput';
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

const StyledBooleanInputContainer = styled.div`
  padding-inline: ${({ theme }) => theme.spacing(2)};
`;

type EditingMode = 'input' | 'variable';

type WorkflowFormBooleanFieldInputProps = {
  label?: string;
  defaultValue: boolean | string | undefined;
  onPersist: (value: boolean | null | string) => void;
  readonly?: boolean;
};

export const WorkflowFormBooleanFieldInput = ({
  label,
  defaultValue,
  onPersist,
  readonly,
}: WorkflowFormBooleanFieldInputProps) => {
  const variablesDropdownId = useId();

  const defaultEditingMode =
    isString(defaultValue) && defaultValue.startsWith('{{')
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
    <StyledContainer>
      {label ? <InputLabel>{label}</InputLabel> : null}

      <StyledRowContainer>
        <StyledInputContainer hasRightElement>
          {editingMode === 'input' ? (
            <StyledBooleanInputContainer>
              <BooleanInput
                value={draftValue as boolean}
                readonly={readonly}
                onToggle={handleChange}
              />
            </StyledBooleanInputContainer>
          ) : (
            <StyledVariableContainer>
              <SortOrFilterChip
                labelValue={extractVariableLabel(draftValue as string)}
                onRemove={handleUnlinkVariable}
              />
            </StyledVariableContainer>
          )}
        </StyledInputContainer>

        <StyledSearchVariablesDropdownContainer readonly={readonly}>
          <SearchVariablesDropdown
            inputId={variablesDropdownId}
            onVariableSelect={handleVariableTagInsert}
            disabled={readonly}
          />
        </StyledSearchVariablesDropdownContainer>
      </StyledRowContainer>
    </StyledContainer>
  );
};
