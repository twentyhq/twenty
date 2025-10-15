import { getInitialEditorContent } from '@/workflow/workflow-variables/utils/getInitialEditorContent';
import { VariableTag } from '@/workflow/workflow-variables/utils/variableTag';
import Document from '@tiptap/extension-document';
import HardBreak from '@tiptap/extension-hard-break';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { Placeholder, UndoRedo } from '@tiptap/extensions';
import { AllSelection } from '@tiptap/pm/state';
import { type Editor, useEditor } from '@tiptap/react';
import { isDefined } from 'twenty-shared/utils';
type UseTextVariableEditorProps = {
  placeholder: string | undefined;
  multiline: boolean | undefined;
  readonly: boolean | undefined;
  defaultValue: string | undefined | null;
  onUpdate: (editor: Editor) => void;
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
      Placeholder.configure({ placeholder }),
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

          tr.replaceSelection(slice);

          const parsedJson = JSON.parse(tr.doc.textContent);
          const formattedJson = JSON.stringify(parsedJson, null, 2);

          const formattedDocNode = schema.nodeFromJSON(
            getInitialEditorContent(formattedJson),
          );

          const rootDocSelection = new AllSelection(tr.doc);
          tr.setSelection(rootDocSelection);
          tr.replaceSelectionWith(formattedDocNode);

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
