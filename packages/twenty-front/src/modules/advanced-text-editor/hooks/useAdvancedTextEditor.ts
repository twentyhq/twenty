import { ResizableImage } from '@/advanced-text-editor/extensions/resizable-image/ResizableImage';
import { UploadImageExtension } from '@/advanced-text-editor/extensions/resizable-image/UploadImageExtension';
import { SlashCommand } from '@/advanced-text-editor/extensions/slash-command/SlashCommand';
import { getInitialAdvancedTextEditorContent } from '@/workflow/workflow-variables/utils/getInitialAdvancedTextEditorContent';
import { VariableTag } from '@/workflow/workflow-variables/utils/variableTag';
import { t } from '@lingui/core/macro';
import { Bold } from '@tiptap/extension-bold';
import { Document } from '@tiptap/extension-document';
import { HardBreak } from '@tiptap/extension-hard-break';
import { Heading } from '@tiptap/extension-heading';
import { Italic } from '@tiptap/extension-italic';
import { Link } from '@tiptap/extension-link';
import { ListKit } from '@tiptap/extension-list';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Strike } from '@tiptap/extension-strike';
import { Text } from '@tiptap/extension-text';
import { Underline } from '@tiptap/extension-underline';
import { Dropcursor, Placeholder, UndoRedo } from '@tiptap/extensions';
import { type Editor, useEditor } from '@tiptap/react';
import { marked } from 'marked';
import { type DependencyList, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

export type AdvancedTextEditorContentType = 'json' | 'markdown';

type UseAdvancedTextEditorProps = {
  placeholder: string | undefined;
  readonly: boolean | undefined;
  defaultValue: string | undefined | null;
  onUpdate: (editor: Editor) => void;
  onFocus?: (editor: Editor) => void;
  onBlur?: (editor: Editor) => void;
  onImageUpload?: (file: File) => Promise<string>;
  onImageUploadError?: (error: Error, file: File) => void;
  enableSlashCommand?: boolean;
  contentType?: AdvancedTextEditorContentType;
};

export const useAdvancedTextEditor = (
  {
    placeholder,
    readonly,
    defaultValue,
    onUpdate,
    onFocus,
    onBlur,
    onImageUpload,
    onImageUploadError,
    enableSlashCommand,
    contentType = 'json',
  }: UseAdvancedTextEditorProps,
  dependencies?: DependencyList,
) => {
  const isMarkdownMode = contentType === 'markdown';

  const extensions = useMemo(
    () => [
      Document,
      Paragraph,
      Text,
      Placeholder.configure({
        placeholder: placeholder ?? t`Enter text or Type '/' for commands`,
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
      ListKit,
      UploadImageExtension.configure({
        onImageUpload,
        onImageUploadError,
      }),
      ...(!readonly && enableSlashCommand !== false ? [SlashCommand] : []),
    ],
    [
      placeholder,
      onImageUpload,
      onImageUploadError,
      readonly,
      enableSlashCommand,
    ],
  );

  const getEditorContent = () => {
    if (!isDefined(defaultValue)) {
      return undefined;
    }

    if (isMarkdownMode) {
      // Convert markdown to HTML, then TipTap will parse the HTML
      return marked.parse(defaultValue, { async: false }) as string;
    }

    return getInitialAdvancedTextEditorContent(defaultValue);
  };

  const editor = useEditor(
    {
      extensions,
      content: getEditorContent(),
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
