import {
  UploadImagePlugin,
  type UploadImagePluginProps,
} from '@/advanced-text-editor/extensions/resizable-image/UploadImagePlugin';
import { Extension } from '@tiptap/core';

type UploadImageOptions = Omit<UploadImagePluginProps, 'editor'> & {};

type UploadImageStorage = {
  placeholderImages: Set<string>;
};

declare module '@tiptap/core' {
  interface Storage {
    uploadImage: UploadImageStorage;
  }
}

export const UploadImageExtension = Extension.create<
  UploadImageOptions,
  UploadImageStorage
>({
  name: 'uploadImage',

  addOptions: () => {
    return {
      allowedMimeTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
      ],
      onImageUpload: undefined,
      onImageUploadError: undefined,
    };
  },

  addStorage: () => {
    return {
      placeholderImages: new Set(),
    };
  },

  addProseMirrorPlugins() {
    const { onImageUpload } = this.options;

    if (!onImageUpload) {
      return [];
    }

    return [
      UploadImagePlugin({
        editor: this.editor,
        allowedMimeTypes: this.options.allowedMimeTypes,
        onImageUpload: this.options.onImageUpload,
        onImageUploadError: this.options.onImageUploadError,
      }),
    ];
  },
});
