import { ResizableImage } from '@/workflow/workflow-steps/workflow-actions/email-action/extensions/resizable-image/ResizableImage';
import { UploadImageExtension } from '@/workflow/workflow-steps/workflow-actions/email-action/extensions/resizable-image/UploadImageExtension';
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
import { Dropcursor, Placeholder, UndoRedo } from '@tiptap/extensions';
import { type Editor, useEditor } from '@tiptap/react';
import { type DependencyList, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

type UseEmailEditorProps = {
  placeholder: string | undefined;
  readonly: boolean | undefined;
  defaultValue: string | undefined | null;
  onUpdate: (editor: Editor) => void;
  onFocus?: (editor: Editor) => void;
  onBlur?: (editor: Editor) => void;
  onImageUpload?: (file: File) => Promise<string>;
  onImageUploadError?: (error: Error, file: File) => void;
};

export const useEmailEditor = (
  {
    placeholder,
    readonly,
    defaultValue,
    onUpdate,
    onFocus,
    onBlur,
    onImageUpload,
    onImageUploadError,
  }: UseEmailEditorProps,
  dependencies?: DependencyList,
) => {
  const extensions = useMemo(
    () => [
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
      Dropcursor,
      UploadImageExtension.configure({
        onImageUpload,
        onImageUploadError,
      }),
    ],
    [placeholder, onImageUpload, onImageUploadError],
  );

  const editor = useEditor(
    {
      extensions,
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
