import { type Editor } from '@tiptap/core';
import { TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

import { type UploadErrorHandler } from '@/advanced-text-editor/types/UploadErrorHandler';
import { type UploadedFile } from '@/advanced-text-editor/types/UploadedFile';
import { insertUploadingNode } from '@/advanced-text-editor/utils/insertUploadingNode';

type InsertUploadingFileArgs = {
  editor: Editor;
  file: File;
  pos?: number;
  onFileUpload: (file: File) => Promise<UploadedFile>;
  onFileUploadError?: UploadErrorHandler;
};

export const insertUploadingFile = ({
  editor,
  file,
  pos,
  onFileUpload,
  onFileUploadError,
}: InsertUploadingFileArgs) =>
  insertUploadingNode({
    editor,
    file,
    pos,
    nodeType: TIPTAP_NODE_TYPES.FILE,
    placeholderAttributes: { name: file.name },
    upload: onFileUpload,
    getUploadedAttributes: (uploadedFile) => ({ url: uploadedFile.url }),
    onUploadError: onFileUploadError,
  });
