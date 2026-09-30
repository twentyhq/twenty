import { type Editor } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

import { type UploadedImage } from '@/advanced-text-editor/types/UploadedImage';
import { insertUploadingImage } from '@/advanced-text-editor/utils/insertUploadingImage';

export type UploadImagePluginProps = {
  editor: Editor;
  allowedMimeTypes?: readonly string[];
  onImageUpload?: (file: File) => Promise<UploadedImage>;
  onImageUploadError?: (error: Error, file: File) => void;
};

export const UploadImagePlugin = (options: UploadImagePluginProps) => {
  const { editor, onImageUpload, allowedMimeTypes, onImageUploadError } =
    options;

  return new Plugin({
    key: new PluginKey('uploadImage'),
    props: {
      handleDrop: (view, event) => {
        if (!onImageUpload || !event.dataTransfer?.files?.length) {
          return false;
        }

        const images = Array.from(event.dataTransfer.files).filter((file) =>
          allowedMimeTypes?.includes(file.type),
        );
        if (images.length === 0) {
          return false;
        }

        const pos = view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        });
        if (!pos) {
          return false;
        }

        event.preventDefault();
        event.stopPropagation();

        images.forEach((file) =>
          insertUploadingImage({
            editor,
            file,
            pos: pos.pos,
            onImageUpload,
            onImageUploadError,
          }),
        );
        return true;
      },
      handlePaste: (_view, event) => {
        if (!onImageUpload || !event.clipboardData?.files?.length) {
          return false;
        }

        const images = Array.from(event.clipboardData.files).filter((file) =>
          allowedMimeTypes?.includes(file.type),
        );
        if (images.length === 0) {
          return false;
        }

        event.preventDefault();
        event.stopPropagation();

        images.forEach((file) =>
          insertUploadingImage({
            editor,
            file,
            onImageUpload,
            onImageUploadError,
          }),
        );
        return true;
      },
    },
  });
};
