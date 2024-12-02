import { initializeEditorContent } from '@/workflow/search-variables/utils/initializeEditorContent';
import { VariableTag } from '@/workflow/search-variables/utils/variableTag';
import Document from '@tiptap/extension-document';
import HardBreak from '@tiptap/extension-hard-break';
import Paragraph from '@tiptap/extension-paragraph';
import { default as Placeholder } from '@tiptap/extension-placeholder';
import Text from '@tiptap/extension-text';
import { Editor, useEditor } from '@tiptap/react';
import { isDefined } from 'twenty-ui';

type UseTextVariableEditorProps = {
  placeholder: string | undefined;
  multiline: boolean | undefined;
  readonly: boolean | undefined;
  defaultValue: string | undefined;
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
    ],
    editable: !readonly,
    onCreate: ({ editor }) => {
      if (isDefined(defaultValue)) {
        initializeEditorContent(editor, defaultValue);
      }
    },
    onUpdate: ({ editor }) => {
      onUpdate(editor);
    },
    editorProps: {
      handleKeyDown: (view, event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();

          const { state } = view;
          const { tr } = state;

          // Insert hard break using the view's state and dispatch
          const transaction = tr.replaceSelectionWith(
            state.schema.nodes.hardBreak.create(),
          );

          view.dispatch(transaction);

          return true;
        }
        return false;
      },
    },
    enableInputRules: false,
    enablePasteRules: false,
    injectCSS: false,
  });

  return editor;
};
