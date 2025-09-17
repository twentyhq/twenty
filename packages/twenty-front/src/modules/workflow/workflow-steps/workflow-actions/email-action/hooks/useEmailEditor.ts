import { ResizableImage } from '@/workflow/workflow-steps/workflow-actions/email-action/extensions/ResizableImage';
import { getInitialEmailEditorContent } from '@/workflow/workflow-variables/utils/getInitialEmailEditorContent';
import { VariableTag } from '@/workflow/workflow-variables/utils/variableTag';
import { Bold } from '@tiptap/extension-bold';
import { Document } from '@tiptap/extension-document';
import { HardBreak } from '@tiptap/extension-hard-break';
import { Heading } from '@tiptap/extension-heading';
import { Italic } from '@tiptap/extension-italic';
import { Link } from '@tiptap/extension-link';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Strike } from '@tiptap/extension-strike';
import { Text } from '@tiptap/extension-text';
import { Underline } from '@tiptap/extension-underline';
import { Placeholder, UndoRedo } from '@tiptap/extensions';
import { type Editor, useEditor } from '@tiptap/react';
import { type DependencyList } from 'react';
import { isDefined } from 'twenty-shared/utils';

type UseEmailEditorProps = {
  placeholder: string | undefined;
  readonly: boolean | undefined;
  defaultValue: string | undefined | null;
  onUpdate: (editor: Editor) => void;
  onFocus?: (editor: Editor) => void;
  onBlur?: (editor: Editor) => void;
};

export const useEmailEditor = (
  {
    placeholder,
    readonly,
    defaultValue,
    onUpdate,
    onFocus,
    onBlur,
  }: UseEmailEditorProps,
  dependencies?: DependencyList,
) => {
  const editor = useEditor(
    {
      extensions: [
        Document,
        Paragraph,
        Text,
        Placeholder.configure({
          placeholder,
        }),
        VariableTag,
        HardBreak.configure({
          keepMarks: false,
        }),
        UndoRedo,
        Bold,
        Italic,
        Strike,
        Underline,
        Heading.configure({
          levels: [1, 2, 3],
        }),
        Link.configure({
          openOnClick: false,
        }),
        ResizableImage,
      ],
      content: isDefined(defaultValue)
        ? getInitialEmailEditorContent(defaultValue)
        : undefined,
      editable: !readonly,
      onUpdate: ({ editor }) => {
        onUpdate(editor);
      },
      onFocus: ({ editor }) => {
        onFocus?.(editor);
      },
      onBlur: ({ editor }) => {
        onBlur?.(editor);
      },
      editorProps: {
        scrollThreshold: 60,
        scrollMargin: 60,
      },
      injectCSS: false,
    },
    dependencies,
  );

  return editor;
};
