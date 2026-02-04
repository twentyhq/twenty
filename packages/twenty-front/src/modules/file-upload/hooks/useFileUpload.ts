import { FileUploadContext } from '@/file-upload/contexts/FileUploadContext';
import { useContext } from 'react';

export const useFileUpload = () => {
  const context = useContext(FileUploadContext);

  if (!context) {
    throw new Error('useFileUpload must be used within a FileUploadProvider');
  }

  return context;
};
