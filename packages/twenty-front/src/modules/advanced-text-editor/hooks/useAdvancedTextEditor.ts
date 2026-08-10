import { type AdvancedTextEditorProfile } from '@/advanced-text-editor/types/AdvancedTextEditorProfile';
import { type UploadedImage } from '@/advanced-text-editor/types/UploadedImage';
import { buildAdvancedTextEditorExtensions } from '@/advanced-text-editor/utils/buildAdvancedTextEditorExtensions';
import { deserializeAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/deserializeAdvancedTextEditorDocument';
import { type Content } from '@tiptap/core';
import { type Editor, type EditorOptions, useEditor } from '@tiptap/react';
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

    return deserializeAdvancedTextEditorDocument({
      serializedDocument: defaultValue,
      parseLegacyDocument: profile.parseLegacyDocument,
    });
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
