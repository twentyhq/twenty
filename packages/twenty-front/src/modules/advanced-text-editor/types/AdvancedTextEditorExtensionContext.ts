import { type UploadedFile } from '@/advanced-text-editor/types/UploadedFile';
import { type UploadedImage } from '@/advanced-text-editor/types/UploadedImage';

export type AdvancedTextEditorExtensionContext = {
  onImageUpload?: (file: File) => Promise<UploadedImage>;
  onImageUploadError?: (error: Error, file: File) => void;
  onFileUpload?: (file: File) => Promise<UploadedFile>;
  onFileUploadError?: (error: Error, file: File) => void;
};
