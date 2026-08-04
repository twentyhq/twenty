import { type AdvancedTextEditorProfile } from '@/advanced-text-editor/types/AdvancedTextEditorProfile';
import { type UploadedImage } from '@/advanced-text-editor/types/UploadedImage';
import { buildAdvancedTextEditorExtensions } from '@/advanced-text-editor/utils/buildAdvancedTextEditorExtensions';
import { getInitialAdvancedTextEditorContent } from '@/advanced-text-editor/utils/getInitialAdvancedTextEditorContent';
import { type Content } from '@tiptap/core';
import { type Editor, type EditorOptions, useEditor } from '@tiptap/react';
import { marked } from 'marked';
import { type DependencyList, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

type UseAdvancedTextEditorProps = {
  profile: AdvancedTextEditorProfile;
  placeholder: string | undefined;
  readonly: boolean | undefined;
  defaultValue: string | undefined | null;
  onUpdate: (editor: Editor) => void;
  onFocus?: (editor: Editor) => void;
  onBlur?: (editor: Editor) => void;
  onImageUpload?: (file: File) => Promise<UploadedImage>;
  onImageUploadError?: (error: Error, file: File) => void;
  content?: Content;
  editorProps?: EditorOptions['editorProps'];
};

export const useAdvancedTextEditor = (
  {
    profile,
    placeholder,
    readonly,
    defaultValue,
    onUpdate,
    onFocus,
    onBlur,
    onImageUpload,
    onImageUploadError,
    content,
    editorProps,
  }: UseAdvancedTextEditorProps,
  dependencies?: DependencyList,
) => {
  const { contentType } = profile;

  const extensions = useMemo(
    () =>
      buildAdvancedTextEditorExtensions({
        profile,
        context: {
          onImageUpload,
          onImageUploadError,
        },
        placeholder,
        readonly,
      }),
    [profile, placeholder, onImageUpload, onImageUploadError, readonly],
  );

  const getEditorContent = (): Content | undefined => {
    if (isDefined(content)) {
      return content;
    }

    if (!isDefined(defaultValue)) {
      return undefined;
    }

    if (contentType === 'markdown') {
      // Convert markdown to HTML, then TipTap will parse the HTML
      return marked.parse(defaultValue, { async: false }) as string;
    }

    if (contentType === 'html') {
      return defaultValue;
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
        ...editorProps,
      },
      injectCSS: false,
    },
    dependencies,
  );

  return editor;
};
