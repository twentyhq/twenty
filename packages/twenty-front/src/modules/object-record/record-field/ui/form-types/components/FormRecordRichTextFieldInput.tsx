import {
  FormattingToolbarExtension,
  LinkToolbarExtension,
  SuggestionMenu,
} from '@blocknote/core/extensions';
import { useCreateBlockNote } from '@blocknote/react';
import { useLingui } from '@lingui/react/macro';
import {
  type KeyboardEvent,
  useContext,
  useEffect,
  useId,
  useState,
} from 'react';
import { Key } from 'ts-key-enum';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components';
import { Field } from 'twenty-ui/primitives/input';

import { BLOCK_SCHEMA } from '@/blocknote-editor/blocks/Schema';
import { BlockEditor } from '@/blocknote-editor/components/BlockEditor';
import { BLOCK_EDITOR_GLOBAL_HOTKEYS_CONFIG } from '@/blocknote-editor/constants/BlockEditorGlobalHotkeysConfig';
import { countBlocksDeep } from '@/blocknote-editor/utils/countBlocksDeep';
import { filterBlocksSupportedBySchema } from '@/blocknote-editor/utils/filterBlocksSupportedBySchema';
import { parseInitialBlocknote } from '@/blocknote-editor/utils/parseInitialBlocknote';
import { FormFieldEscapeContext } from '@/object-record/record-field/ui/contexts/FormFieldEscapeContext';
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

  const { enqueueToast } = useToast();

  const [{ initialBlocks, hasUnreadableStoredValue }] = useState(() => {
    const parsedBlocks = parseInitialBlocknote(
      defaultValue?.blocknote ?? defaultValue?.markdown,
    );

    const supportedBlocks = filterBlocksSupportedBySchema(
      parsedBlocks,
      BLOCK_SCHEMA.blockSchema,
    );

    return {
      initialBlocks: isNonEmptyArray(supportedBlocks)
        ? supportedBlocks
        : undefined,
      hasUnreadableStoredValue:
        countBlocksDeep(supportedBlocks) < countBlocksDeep(parsedBlocks),
    };
  });

  const handleUploadFile = async (): Promise<string> => {
    enqueueToast({
      variant: 'error',
      children: t`Save the record before attaching a file`,
    });

    return '';
  };

  const editor = useCreateBlockNote({
    uploadFile: handleUploadFile,
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

  const onFieldEscape = useContext(FormFieldEscapeContext);

  const isEditorMenuOrToolbarShown = () =>
    editor.getExtension(SuggestionMenu)?.shown() ||
    editor.getExtension(FormattingToolbarExtension)?.store.state ||
    isDefined(editor.getExtension(LinkToolbarExtension)?.getLinkAtSelection());

  const handleKeyDownCapture = (event: KeyboardEvent) => {
    if (event.nativeEvent.isComposing || event.keyCode === 229) {
      return;
    }

    const isEscapeInEditor =
      event.key === Key.Escape &&
      event.target instanceof Node &&
      isDefined(editor.domElement) &&
      editor.domElement.contains(event.target);

    if (
      !isEscapeInEditor ||
      !isDefined(onFieldEscape) ||
      isEditorMenuOrToolbarShown()
    ) {
      return;
    }

    event.stopPropagation();
    onFieldEscape();
  };

  useEffect(() => {
    return () => {
      removeFocusItemFromFocusStackById({ focusId });
    };
  }, [focusId, removeFocusItemFromFocusStackById]);

  useEffect(() => {
    if (hasUnreadableStoredValue) {
      enqueueToast({
        variant: 'error',
        children: t`This content was saved in an older format and cannot be edited here`,
      });
    }
  }, [hasUnreadableStoredValue, enqueueToast, t]);

  return (
    <FormFieldInputContainer onKeyDownCapture={handleKeyDownCapture}>
      {label ? <Field.Label>{label}</Field.Label> : null}
      <BlockEditor
        editor={editor}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        readonly={readonly || hasUnreadableStoredValue}
      />
    </FormFieldInputContainer>
  );
};
