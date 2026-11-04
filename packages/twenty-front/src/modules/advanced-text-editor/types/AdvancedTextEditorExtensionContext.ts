import { type UploadErrorHandler } from '@/advanced-text-editor/types/UploadErrorHandler';
import { type UploadedFile } from '@/advanced-text-editor/types/UploadedFile';
import { type UploadedImage } from '@/advanced-text-editor/types/UploadedImage';

export type AdvancedTextEditorExtensionContext = {
  onImageUpload?: (file: File) => Promise<UploadedImage>;
  onImageUploadError?: UploadErrorHandler;
  onFileUpload?: (file: File) => Promise<UploadedFile>;
  onFileUploadError?: UploadErrorHandler;
};
