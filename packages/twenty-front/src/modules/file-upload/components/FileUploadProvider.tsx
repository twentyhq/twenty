import {
  FileUploadContext,
  type FileUploadOptions,
} from '@/file-upload/contexts/FileUploadContext';
import styled from '@emotion/styled';
import { useCallback, useEffect, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

const StyledFileInput = styled.input`
  display: none;
`;

export const FileUploadProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadOptions, setUploadOptions] = useState<FileUploadOptions | null>(
    null,
  );

  const openFileUpload = useCallback((options: FileUploadOptions) => {
    setUploadOptions(options);

    setTimeout(() => {
      fileInputRef.current?.click();
    }, 0);
  }, []);

  const handleFileInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      const currentOptions = uploadOptions;

      if (!isDefined(currentOptions)) {
        return;
      }

      try {
        if (!isDefined(files) || files.length === 0) {
          currentOptions.onCancel?.();
        } else {
          const filesArray = Array.from(files);
          await currentOptions.onUpload(filesArray);
        }
      } finally {
        if (isDefined(fileInputRef.current)) {
          fileInputRef.current.value = '';
        }
        setUploadOptions(null);
      }
    },
    [uploadOptions],
  );

  const handleFileInputCancel = useCallback(() => {
    const currentOptions = uploadOptions;

    if (!isDefined(currentOptions)) {
      return;
    }

    try {
      currentOptions.onCancel?.();
    } finally {
      if (isDefined(fileInputRef.current)) {
        fileInputRef.current.value = '';
      }
      setUploadOptions(null);
    }
  }, [uploadOptions]);

  useEffect(() => {
    const input = fileInputRef.current;
    if (!input) {
      return;
    }

    input.addEventListener('cancel', handleFileInputCancel);
    return () => input.removeEventListener('cancel', handleFileInputCancel);
  }, [handleFileInputCancel]);

  return (
    <FileUploadContext.Provider value={{ openFileUpload }}>
      {children}
      <StyledFileInput
        ref={fileInputRef}
        type="file"
        multiple={uploadOptions?.multiple ?? false}
        accept={uploadOptions?.accept}
        onChange={handleFileInputChange}
      />
    </FileUploadContext.Provider>
  );
};
