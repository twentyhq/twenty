import {
  ADVANCED_TEXT_EDITOR_PRESETS,
  type AdvancedTextEditorPresetName,
} from '@/advanced-text-editor/constants/AdvancedTextEditorPresets';
import { buildAdvancedTextEditorExtensions } from '@/advanced-text-editor/utils/buildAdvancedTextEditorExtensions';
import { getInitialAdvancedTextEditorContent } from '@/workflow/workflow-variables/utils/getInitialAdvancedTextEditorContent';
import { type Content } from '@tiptap/core';
import { type Editor, type EditorOptions, useEditor } from '@tiptap/react';
import { marked } from 'marked';
import { type DependencyList, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

type UseAdvancedTextEditorProps = {
  preset: AdvancedTextEditorPresetName;
  placeholder: string | undefined;
  readonly: boolean | undefined;
  defaultValue: string | undefined | null;
  onUpdate: (editor: Editor) => void;
  onFocus?: (editor: Editor) => void;
  onBlur?: (editor: Editor) => void;
  onImageUpload?: (file: File) => Promise<string>;
  onImageUploadError?: (error: Error, file: File) => void;
  // Seeds the editor with already-parsed content instead of running
  // defaultValue through the preset's contentType read path.
  content?: Content;
  editorProps?: EditorOptions['editorProps'];
};

export const useAdvancedTextEditor = (
  {
    preset,
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
  const { contentType, capabilities } = ADVANCED_TEXT_EDITOR_PRESETS[preset];

  const extensions = useMemo(
    () =>
      buildAdvancedTextEditorExtensions({
        capabilities,
        context: {
          onImageUpload,
          onImageUploadError,
        },
        placeholder,
        readonly,
      }),
    [capabilities, placeholder, onImageUpload, onImageUploadError, readonly],
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
