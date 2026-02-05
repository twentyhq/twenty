import { createContext } from 'react';

export type FileUploadCallback = (files: File[]) => void | Promise<void>;

export type FileUploadOptions = {
  multiple?: boolean;
  accept?: string;
  onUpload: FileUploadCallback;
  onCancel?: () => void;
};

export type FileUploadContextValue = {
  openFileUpload: (options: FileUploadOptions) => void;
};

export const FileUploadContext = createContext<FileUploadContextValue | null>(
  null,
);
