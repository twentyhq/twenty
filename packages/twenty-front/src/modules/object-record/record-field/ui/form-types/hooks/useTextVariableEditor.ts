import { parseEditorContent } from '@/workflow/workflow-variables/utils/parseEditorContent';
import { getInitialEditorContent } from '@/advanced-text-editor/utils/getInitialEditorContent';
import { WorkflowVariableTag } from '@/workflow/workflow-variables/extensions/WorkflowVariableTag';
import Document from '@tiptap/extension-document';
import HardBreak from '@tiptap/extension-hard-break';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { Placeholder } from '@tiptap/extensions/placeholder';
import { UndoRedo } from '@tiptap/extensions/undo-redo';
import { Slice } from '@tiptap/pm/model';

import { type Editor, useEditor } from '@tiptap/react';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { isDefined, parseJson } from 'twenty-shared/utils';
import { type JsonValue } from 'type-fest';

type UseTextVariableEditorProps = {
  placeholder: string | undefined;
  multiline: boolean | undefined;
  readonly: boolean | undefined;
  defaultValue: string | undefined | null;
  onUpdate: (editor: Editor) => void;
};

/**
 * Checks if the given text is a valid JSON object (not array, primitive, or null)
 */
const isJsonObject = (text: string): boolean => {
  try {
    const parsed = JSON.parse(text);
    return parsed !== null && typeof parsed === 'object';
  } catch {
    return false;
  }
};

export const useTextVariableEditor = ({
  placeholder,
  multiline,
  readonly,
  defaultValue,
  onUpdate,
}: UseTextVariableEditorProps) => {
  // Tiptap retains this callback outside React; the ref bridges its decoration
  // lifecycle to updated props without recreating the editor or its history.
  // oxlint-disable-next-line twenty/no-state-useref
  const placeholderRef = useRef(placeholder);
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Placeholder.configure({
        placeholder: () => placeholderRef.current ?? '',
      }),
      WorkflowVariableTag,
      ...(multiline
        ? [
            HardBreak.configure({
              keepMarks: false,
            }),
          ]
        : []),
      UndoRedo,
    ],
    content: isDefined(defaultValue)
      ? getInitialEditorContent(defaultValue)
      : undefined,
    editable: !readonly,
    onUpdate: ({ editor }) => {
      onUpdate(editor);
    },
    editorProps: {
      handleKeyDown: (view, event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();

          if (multiline === true) {
            const { state } = view;
            const { tr } = state;
            const transaction = tr.replaceSelectionWith(
              state.schema.nodes.hardBreak.create(),
            );

            view.dispatch(transaction);
          }

          return true;
        }
        return false;
      },
      handlePaste: (view, event) => {
        const plainText = event.clipboardData?.getData('text/plain') ?? '';
        const {
          state: { schema, tr },
        } = view;

        if (isJsonObject(plainText)) {
          const parsedJson = parseJson<JsonValue>(plainText);
          const formattedJson = multiline
            ? JSON.stringify(parsedJson, null, 2)
            : JSON.stringify(parsedJson);
          const docNode = schema.nodeFromJSON(
            getInitialEditorContent(formattedJson),
          );
          const inlineContent = docNode.firstChild?.content;

          if (inlineContent && inlineContent.size > 0) {
            tr.replaceSelection(new Slice(inlineContent, 0, 0));
            view.dispatch(tr);
          }
          return true;
        }

        if (multiline && plainText.includes('\n')) {
          const docNode = schema.nodeFromJSON(
            getInitialEditorContent(plainText),
          );
          const inlineContent = docNode.firstChild?.content;

          if (inlineContent && inlineContent.size > 0) {
            tr.replaceSelection(new Slice(inlineContent, 0, 0));
            view.dispatch(tr);
            return true;
          }
          return false;
        }

        return false;
      },
    },
    enableInputRules: false,
    enablePasteRules: false,
    injectCSS: false,
  });

  useLayoutEffect(() => {
    if (
      isDefined(editor) &&
      !editor.isDestroyed &&
      parseEditorContent(editor.getJSON()) !== (defaultValue ?? '')
    ) {
      editor.commands.setContent(getInitialEditorContent(defaultValue ?? ''), {
        emitUpdate: false,
      });
    }
  }, [editor, defaultValue]);

  useEffect(() => {
    editor?.setEditable(!readonly, false);
  }, [editor, readonly]);

  useEffect(() => {
    placeholderRef.current = placeholder;

    // Placeholder decorations need a transaction to refresh without replacing
    // the editor and losing its content, selection, or undo history.
    if (isDefined(editor) && !editor.isDestroyed) {
      editor.view.dispatch(editor.state.tr.setMeta('addToHistory', false));
    }
  }, [editor, placeholder]);

  return editor;
};
