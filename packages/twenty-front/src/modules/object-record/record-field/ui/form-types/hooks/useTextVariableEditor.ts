import { getInitialEditorContent } from '@/workflow/workflow-variables/utils/getInitialEditorContent';
import { VariableTag } from '@/workflow/workflow-variables/utils/variableTag';
import Document from '@tiptap/extension-document';
import HardBreak from '@tiptap/extension-hard-break';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { Placeholder, UndoRedo } from '@tiptap/extensions';
import { AllSelection, TextSelection } from '@tiptap/pm/state';
import { type Editor, useEditor } from '@tiptap/react';
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
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Placeholder.configure({
        placeholder,
      }),
      VariableTag,
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

          // Insert hard break using the view's state and dispatch
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
      handlePaste: (view, _, slice) => {
        try {
          const {
            state: { schema, tr },
          } = view;
          const originalPos = tr.selection.from;
          const pastedText = slice.content.firstChild?.textContent ?? '';

          // Apply the clipboard text to the document without formatting
          tr.replaceSelection(slice);

          const newPos = tr.selection.from;

          // Parse the entire document content as JSON and create formatted document node
          const parsedJson = parseJson<JsonValue>(tr.doc.textContent);
          const formattedJson = JSON.stringify(parsedJson, null, 2);
          const formattedDocNode = schema.nodeFromJSON(
            getInitialEditorContent(formattedJson),
          );

          // Replace entire document with formatted JSON
          const rootDocSelection = new AllSelection(tr.doc);
          tr.setSelection(rootDocSelection);
          tr.replaceSelectionWith(formattedDocNode);

          // Restore cursor position based on pasted content type
          const finalPos = isJsonObject(pastedText) ? originalPos : newPos;
          tr.setSelection(TextSelection.create(tr.doc, finalPos));

          view.dispatch(tr);
          return true;
        } catch {
          return false;
        }
      },
    },
    enableInputRules: false,
    enablePasteRules: false,
    injectCSS: false,
  });

  return editor;
};
