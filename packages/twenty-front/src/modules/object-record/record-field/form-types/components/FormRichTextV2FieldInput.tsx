import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { useCreateBlockNote } from '@blocknote/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useState } from 'react';

type FormRichTextV2FieldInputProps = {
  label?: string;
  error?: string;
  hint?: string;
  defaultValue: string | undefined;
  onChange: (value: string) => void;
  onBlur?: () => void;
  readonly?: boolean;
  placeholder?: string;
  VariablePicker?: VariablePickerComponent;
};

export const FormRichTextV2FieldInput = ({
  label,
  error,
  hint,
  defaultValue: rawDefaultValue,
  placeholder,
  onChange,
  onBlur,
  readonly,
  VariablePicker,
}: FormRichTextV2FieldInputProps) => {
  const editor = useCreateBlockNote();

  const [setupState, setSetupState] = useState<
    | { status: 'resolving-default-value'; defaultValue: undefined }
    | { status: 'done'; defaultValue: string }
  >({ status: 'resolving-default-value', defaultValue: undefined });

  useEffect(() => {
    editor
      .blocksToMarkdownLossy(
        isNonEmptyString(rawDefaultValue) ? JSON.parse(rawDefaultValue) : [],
      )
      .then((defaultValueAsMarkdown) => {
        setSetupState({
          status: 'done',
          defaultValue: defaultValueAsMarkdown,
        });
      });
  }, []);

  const handleChange = async (value: string) => {
    const blocks = await editor.tryParseMarkdownToBlocks(value);

    onChange(JSON.stringify(blocks));
  };

  return (
    <FormTextFieldInput
      key={setupState.status}
      label={label}
      error={error}
      hint={hint}
      defaultValue={setupState.defaultValue}
      placeholder={placeholder}
      onChange={handleChange}
      onBlur={onBlur}
      multiline
      readonly={setupState.status !== 'done' || readonly}
      VariablePicker={VariablePicker}
    />
  );
};
