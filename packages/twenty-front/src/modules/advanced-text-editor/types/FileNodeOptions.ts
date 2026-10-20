import { type UploadedFile } from '@/advanced-text-editor/types/UploadedFile';

export type FileNodeOptions = {
  onFileUpload?: (file: File) => Promise<UploadedFile>;
  onFileUploadError?: (error: Error, file: File) => void;
};
