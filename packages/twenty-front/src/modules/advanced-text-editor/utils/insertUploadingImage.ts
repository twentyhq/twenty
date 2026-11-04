import { type Editor } from '@tiptap/core';
import { TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

import { type UploadErrorHandler } from '@/advanced-text-editor/types/UploadErrorHandler';
import { type UploadedImage } from '@/advanced-text-editor/types/UploadedImage';
import { insertUploadingNode } from '@/advanced-text-editor/utils/insertUploadingNode';

type InsertUploadingImageArgs = {
  editor: Editor;
  file: File;
  pos?: number;
  onImageUpload: (file: File) => Promise<UploadedImage>;
  onImageUploadError?: UploadErrorHandler;
};

export const insertUploadingImage = ({
  editor,
  file,
  pos,
  onImageUpload,
  onImageUploadError,
}: InsertUploadingImageArgs) =>
  insertUploadingNode({
    editor,
    file,
    pos,
    nodeType: TIPTAP_NODE_TYPES.IMAGE,
    placeholderAttributes: { alt: file.name },
    upload: onImageUpload,
    getUploadedAttributes: (uploadedImage) => ({
      fileId: uploadedImage.fileId ?? null,
      src: uploadedImage.url,
    }),
    onUploadError: onImageUploadError,
  });
