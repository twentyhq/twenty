import { initializeEditorContent } from '@/workflow/workflow-variables/utils/initializeEditorContent';
import { VariableTag } from '@/workflow/workflow-variables/utils/variableTag';
import Document from '@tiptap/extension-document';
import HardBreak from '@tiptap/extension-hard-break';
import Paragraph from '@tiptap/extension-paragraph';
import { default as Placeholder } from '@tiptap/extension-placeholder';
import Text from '@tiptap/extension-text';
import { Editor, useEditor } from '@tiptap/react';
import { useState } from 'react';
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
  const [isInitializing, setIsInitializing] = useState(true);

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
      setIsInitializing(false);
    },
    onUpdate: ({ editor }) => {
      if (isInitializing) {
        return;
      }
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
    },
    enableInputRules: false,
    enablePasteRules: false,
    injectCSS: false,
  });

  return editor;
};
