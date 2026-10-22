import { type Editor, Extension } from '@tiptap/core';
import { FileHandler } from '@tiptap/extension-file-handler';
import { EMAIL_IMAGE_MIME_TYPES } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { type AdvancedTextEditorExtensionContext } from '@/advanced-text-editor/types/AdvancedTextEditorExtensionContext';
import { getPositionAfterCursorBlock } from '@/advanced-text-editor/utils/getPositionAfterCursorBlock';
import { insertUploadingFile } from '@/advanced-text-editor/utils/insertUploadingFile';
import { insertUploadingImage } from '@/advanced-text-editor/utils/insertUploadingImage';
import { isImageFile } from '@/advanced-text-editor/utils/isImageFile';

declare module '@tiptap/core' {
  interface Storage {
    upload: AdvancedTextEditorExtensionContext;
  }
}

export const UploadExtension = Extension.create<
  AdvancedTextEditorExtensionContext,
  AdvancedTextEditorExtensionContext
>({
  name: 'upload',

  addOptions: () => ({
    onImageUpload: undefined,
    onImageUploadError: undefined,
    onFileUpload: undefined,
    onFileUploadError: undefined,
  }),

  addStorage() {
    return {
      onImageUpload: this.options.onImageUpload,
      onImageUploadError: this.options.onImageUploadError,
      onFileUpload: this.options.onFileUpload,
      onFileUploadError: this.options.onFileUploadError,
    };
  },

  addExtensions() {
    const {
      onImageUpload,
      onImageUploadError,
      onFileUpload,
      onFileUploadError,
    } = this.options;

    if (!isDefined(onImageUpload) && !isDefined(onFileUpload)) {
      return [];
    }

    const insertUploadingFiles = ({
      editor,
      files,
      pos,
    }: {
      editor: Editor;
      files: File[];
      pos: number;
    }) =>
      [...files].reverse().forEach((file) => {
        if (isImageFile(file) && isDefined(onImageUpload)) {
          insertUploadingImage({
            editor,
            file,
            pos,
            onImageUpload,
            onImageUploadError,
          });

          return;
        }

        if (!isImageFile(file) && isDefined(onFileUpload)) {
          insertUploadingFile({
            editor,
            file,
            pos,
            onFileUpload,
            onFileUploadError,
          });
        }
      });

    return [
      FileHandler.configure({
        allowedMimeTypes: isDefined(onFileUpload)
          ? undefined
          : [...EMAIL_IMAGE_MIME_TYPES],
        consumePasteEvent: true,
        onPaste: (editor, files) =>
          insertUploadingFiles({
            editor,
            files,
            pos: getPositionAfterCursorBlock(editor.state),
          }),
        onDrop: (editor, files, pos) =>
          insertUploadingFiles({ editor, files, pos }),
      }),
    ];
  },
});
