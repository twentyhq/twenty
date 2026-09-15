import { useCreateBlockNote } from '@blocknote/react';
import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import { Field } from 'twenty-ui/input';

import { BLOCK_SCHEMA } from '@/blocknote-editor/blocks/Schema';
import { BlockEditor } from '@/blocknote-editor/components/BlockEditor';
import { BLOCK_EDITOR_GLOBAL_HOTKEYS_CONFIG } from '@/blocknote-editor/constants/BlockEditorGlobalHotkeysConfig';
import { type FieldRichTextValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { parseRecordRichTextInitialBlocks } from '@/object-record/record-field/ui/form-types/utils/parseRecordRichTextInitialBlocks';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';

type FormRecordRichTextFieldInputProps = {
  label?: string;
  error?: string;
  hint?: string;
  defaultValue: FieldRichTextValue | undefined;
  onChange: (value: FieldRichTextValue) => void;
  readonly?: boolean;
  placeholder?: string;
};

export const FormRecordRichTextFieldInput = ({
  label,
  error,
  hint,
  defaultValue,
  placeholder,
  onChange,
  readonly,
}: FormRecordRichTextFieldInputProps) => {
  const { t } = useLingui();

  const focusId = useId();

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const editor = useCreateBlockNote({
    initialContent: parseRecordRichTextInitialBlocks(defaultValue),
    domAttributes: { editor: { class: 'editor' } },
    schema: BLOCK_SCHEMA,
    placeholders: {
      default: placeholder ?? t`Type '/' for commands`,
    },
  });

  const handleChange = () => {
    onChange({
      blocknote: JSON.stringify(editor.document),
      markdown: null,
    });
  };

  const handleFocus = () => {
    pushFocusItemToFocusStack({
      component: {
        instanceId: focusId,
        type: FocusComponentType.ACTIVITY_RICH_TEXT_EDITOR,
      },
      focusId,
      globalHotkeysConfig: BLOCK_EDITOR_GLOBAL_HOTKEYS_CONFIG,
    });
  };

  const handleBlur = () => {
    removeFocusItemFromFocusStackById({ focusId });
  };

  return (
    <FormFieldInputContainer>
      {label ? <Field.Label>{label}</Field.Label> : null}
      <BlockEditor
        editor={editor}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        readonly={readonly}
      />
      {hint && <Field.Description>{hint}</Field.Description>}
      {error && <Field.Error match>{error}</Field.Error>}
    </FormFieldInputContainer>
  );
};
