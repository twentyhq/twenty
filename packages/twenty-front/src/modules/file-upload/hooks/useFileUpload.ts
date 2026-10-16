import { FileUploadContext } from '@/file-upload/contexts/FileUploadContext';
import { useContext } from 'react';
import { doNotTranslate } from 'twenty-shared/utils';

export const useFileUpload = () => {
  const context = useContext(FileUploadContext);

  if (!context) {
    throw new Error(
      doNotTranslate('useFileUpload must be used within a FileUploadProvider'),
    );
  }

  return context;
};
