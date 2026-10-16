import { FileUploadContext } from '@/file-upload/contexts/FileUploadContext';
import { useContext } from 'react';

export const useFileUpload = () => {
  const context = useContext(FileUploadContext);

  if (!context) {
    // oxlint-disable-next-line lingui/no-unlocalized-strings -- This is a developer-only configuration or context invariant diagnostic.
    throw new Error('useFileUpload must be used within a FileUploadProvider');
  }

  return context;
};
