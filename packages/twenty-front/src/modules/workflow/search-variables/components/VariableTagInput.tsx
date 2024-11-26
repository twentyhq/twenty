import { FormFieldInputBase } from '@/object-record/record-field/form-types/components/FormFieldInputBase';
import { TextVariableEditor } from '@/object-record/record-field/form-types/components/TextVariableEditor';
import { useTextVariableEditor } from '@/object-record/record-field/form-types/hooks/useTextVariableEditor';
import { StyledSearchVariablesDropdownContainer } from '@/workflow/components/WorkflowFormFieldInputBase';
import SearchVariablesDropdown from '@/workflow/search-variables/components/SearchVariablesDropdown';
import { parseEditorContent } from '@/workflow/search-variables/utils/parseEditorContent';
import { useDebouncedCallback } from 'use-debounce';

interface VariableTagInputProps {
  inputId: string;
  label?: string;
  value?: string;
  placeholder?: string;
  multiline?: boolean;
  onChange?: (content: string) => void;
  readonly?: boolean;
}

export const VariableTagInput = ({
  inputId,
  label,
  value,
  placeholder,
  multiline,
  onChange,
  readonly,
}: VariableTagInputProps) => {
  const deboucedOnUpdate = useDebouncedCallback((editor) => {
    const jsonContent = editor.getJSON();
    const parsedContent = parseEditorContent(jsonContent);
    onChange?.(parsedContent);
  }, 500);

  const editor = useTextVariableEditor({
    placeholder,
    multiline,
    readonly,
    defaultValue: value,
    onUpdate: deboucedOnUpdate,
  });

  if (!editor) {
    return null;
  }

  return (
    <FormFieldInputBase
      label={label}
      Input={
        <TextVariableEditor
          editor={editor}
          multiline={multiline}
          readonly={readonly}
        />
      }
      RightElement={
        <StyledSearchVariablesDropdownContainer
          multiline={multiline}
          readonly={readonly}
        >
          <SearchVariablesDropdown
            inputId={inputId}
            onVariableSelect={(variable) => {
              editor.commands.insertVariableTag(variable);
            }}
            disabled={readonly}
          />
        </StyledSearchVariablesDropdownContainer>
      }
      multiline={multiline}
    />
  );
};

export default VariableTagInput;
