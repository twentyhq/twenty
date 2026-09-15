import { useCreateBlockNote } from '@blocknote/react';
import { useLingui } from '@lingui/react/macro';
import { useEffect, useId } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Field } from 'twenty-ui/input';

import { BLOCK_SCHEMA } from '@/blocknote-editor/blocks/Schema';
import { BlockEditor } from '@/blocknote-editor/components/BlockEditor';
import { BLOCK_EDITOR_GLOBAL_HOTKEYS_CONFIG } from '@/blocknote-editor/constants/BlockEditorGlobalHotkeysConfig';
import { filterBlocksSupportedBySchema } from '@/blocknote-editor/utils/filterBlocksSupportedBySchema';
import { parseInitialBlocknote } from '@/blocknote-editor/utils/parseInitialBlocknote';
import { type FieldRichTextValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';

import '@blocknote/mantine/style.css';
import '@blocknote/react/style.css';

type FormRecordRichTextFieldInputProps = {
  label?: string;
  defaultValue: FieldRichTextValue | undefined;
  onChange: (value: FieldRichTextValue) => void;
  readonly?: boolean;
  placeholder?: string;
};

export const FormRecordRichTextFieldInput = ({
  label,
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

  const supportedBlocks = filterBlocksSupportedBySchema(
    parseInitialBlocknote(defaultValue?.blocknote),
    BLOCK_SCHEMA.blockSchema,
  );

  const initialBlocks = isNonEmptyArray(supportedBlocks)
    ? supportedBlocks
    : undefined;

  const editor = useCreateBlockNote({
    initialContent: initialBlocks,
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

  useEffect(() => {
    return () => {
      removeFocusItemFromFocusStackById({ focusId });
    };
  }, [focusId, removeFocusItemFromFocusStackById]);

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
    </FormFieldInputContainer>
  );
};
