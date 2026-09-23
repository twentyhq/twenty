import { type FileUploadPrincipal } from 'src/engine/core-modules/file/file-upload/types/file-upload-principal.type';

export type FileFieldSettings = {
  isTemporaryFile: boolean;
  toDelete: boolean;
  uploadPrincipal?: FileUploadPrincipal;
};

export type FileSettings = FileFieldSettings;
