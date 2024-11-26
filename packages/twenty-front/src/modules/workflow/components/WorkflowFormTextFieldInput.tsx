import {
  StyledContainer,
  StyledInputContainer,
  StyledRowContainer,
} from '@/object-record/record-field/form-types/components/FormFieldInputBase';
import { TextVariableEditor } from '@/object-record/record-field/form-types/components/TextVariableEditor';
import { useTextVariableEditor } from '@/object-record/record-field/form-types/hooks/useTextVariableEditor';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { StyledSearchVariablesDropdownContainer } from '@/workflow/components/WorkflowFormFieldInputBase';
import SearchVariablesDropdown from '@/workflow/search-variables/components/SearchVariablesDropdown';
import { parseEditorContent } from '@/workflow/search-variables/utils/parseEditorContent';
import { useId } from 'react';
import { isDefined } from 'twenty-ui';

type WorkflowFormTextFieldInputProps = {
  label?: string;
  defaultValue: string | undefined;
  placeholder: string;
  onPersist: (value: null | string) => void;
  multiline?: boolean;
  readonly?: boolean;
};

export const WorkflowFormTextFieldInput = ({
  label,
  defaultValue,
  placeholder,
  onPersist,
  multiline,
  readonly,
}: WorkflowFormTextFieldInputProps) => {
  const variablesDropdownId = useId();

  const editor = useTextVariableEditor({
    placeholder,
    multiline,
    readonly,
    defaultValue,
    onUpdate: (editor) => {
      const jsonContent = editor.getJSON();
      const parsedContent = parseEditorContent(jsonContent);

      onPersist(parsedContent);
    },
  });

  const onVariableTagInsert = (variable: string) => {
    if (!isDefined(editor)) {
      throw new Error(
        'Expected the editor to be defined when a variable is selected',
      );
    }

    editor.commands.insertVariableTag(variable);
  };

  if (!isDefined(editor)) {
    return null;
  }

  return (
    <StyledContainer>
      {label ? <InputLabel>{label}</InputLabel> : null}

      <StyledRowContainer multiline={multiline}>
        <StyledInputContainer hasRightElement multiline={multiline}>
          <TextVariableEditor
            editor={editor}
            multiline={multiline}
            readonly={readonly}
          />
        </StyledInputContainer>

        <StyledSearchVariablesDropdownContainer
          multiline={multiline}
          readonly={readonly}
        >
          <SearchVariablesDropdown
            inputId={variablesDropdownId}
            onVariableSelect={onVariableTagInsert}
            disabled={readonly}
          />
        </StyledSearchVariablesDropdownContainer>
      </StyledRowContainer>
    </StyledContainer>
  );
};
