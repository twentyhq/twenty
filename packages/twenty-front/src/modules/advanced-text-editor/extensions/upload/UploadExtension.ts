import { type Editor, Extension } from '@tiptap/core';
import { FileHandler } from '@tiptap/extension-file-handler';
import { EMAIL_IMAGE_MIME_TYPES } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { type AdvancedTextEditorExtensionContext } from '@/advanced-text-editor/types/AdvancedTextEditorExtensionContext';
import { insertUploadingFile } from '@/advanced-text-editor/utils/insertUploadingFile';
import { insertUploadingImage } from '@/advanced-text-editor/utils/insertUploadingImage';

const isImageFile = (file: File) =>
  EMAIL_IMAGE_MIME_TYPES.includes(
    file.type as (typeof EMAIL_IMAGE_MIME_TYPES)[number],
  );

export const UploadExtension =
  Extension.create<AdvancedTextEditorExtensionContext>({
    name: 'upload',

    addOptions: () => ({
      onImageUpload: undefined,
      onImageUploadError: undefined,
      onFileUpload: undefined,
      onFileUploadError: undefined,
    }),

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

      const insertUploadingFiles = (
        editor: Editor,
        files: File[],
        pos?: number,
      ) =>
        files.forEach((file) => {
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
          onPaste: (editor, files) => insertUploadingFiles(editor, files),
          onDrop: (editor, files, pos) =>
            insertUploadingFiles(editor, files, pos),
        }),
      ];
    },
  });
