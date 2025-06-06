import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  IconArrowLeft,
  IconArrowRight,
  IconTrash,
  IconUpload,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import {
  StyledDropArea,
  StyledFileDetails,
  StyledFileInfo,
  StyledFileItem,
  StyledFileList,
  StyledFileName,
  StyledNavigationButtons,
  StyledUploadContainer,
} from '../SettingsImport.styles';
import { ImportFormat } from '../types/ImportFormat';
import { formatFileSize } from '../utils/format.utils';
import { Heading } from './Heading';

export const UploadStep = ({
  selectedFormat,
  onBack,
  onNext,
  onFilesSelected,
}: {
  selectedFormat: ImportFormat;
  onBack: () => void;
  onNext: (files: File[]) => void;
  onFilesSelected: (files: File[]) => void;
}) => {
  const { t } = useLingui();
  const { enqueueSnackBar } = useSnackBar();
  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedExtensions = useMemo(
    () => ({ csv: '.csv' }), // Only CSV
    [],
  );
  const format = selectedFormat.toUpperCase();

  const addFiles = useCallback(
    (newFiles: File[]) => {
      const validFiles = newFiles.filter((file) =>
        file.name.toLowerCase().endsWith(acceptedExtensions[selectedFormat]),
      );
      const invalidFileCount = newFiles.length - validFiles.length;

      if (invalidFileCount > 0) {
        enqueueSnackBar(
          t`Some files have an invalid type. Only ${format} files are accepted.`,
          { variant: SnackBarVariant.Warning },
        );
      }

      if (validFiles.length > 0) {
        const uniqueNewFiles = validFiles.filter(
          (newFile) =>
            !files.some((existingFile) => existingFile.name === newFile.name),
        );
        const updatedFiles = [...files, ...uniqueNewFiles];
        setFiles(updatedFiles);
        onFilesSelected(updatedFiles);
      }
    },
    [
      files,
      acceptedExtensions,
      selectedFormat,
      onFilesSelected,
      enqueueSnackBar,
      t,
      format,
    ],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        addFiles(Array.from(e.dataTransfer.files));
      }
    },
    [addFiles],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files !== null && e.target.files.length > 0) {
        addFiles(Array.from(e.target.files));
      }
      if (e.target !== undefined) e.target.value = '';
    },
    [addFiles],
  );

  const handleRemoveFile = (indexToRemove: number) => {
    const updatedFiles = files.filter((_, index) => index !== indexToRemove);
    setFiles(updatedFiles);
    onFilesSelected(updatedFiles);
  };

  const handleDropAreaClick = () => fileInputRef.current?.click();
  const handleNextClick = () => {
    if (files.length > 0) onNext(files);
  };

  const formatTitle = selectedFormat.toUpperCase();
  const uploadTitleText = t`Upload ${formatTitle} File(s)`;
  const descriptionText = t`Upload one or more ${formatTitle} files to create new tables.`;

  return (
    <StyledUploadContainer>
      <Heading title={uploadTitleText} description={descriptionText} />
      <StyledDropArea
        isDragOver={isDragOver}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleDropAreaClick}
        tabIndex={0}
        role="button"
        aria-label={t({
          id: 'upload.dropAreaLabel',
          message: 'File upload area',
        })}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleDropAreaClick();
          }
        }}
      >
        <IconUpload size={32} />
        <div>
          <strong>{t`Drop ${formatTitle} file(s) here`}</strong>
        </div>
        <div>
          {t({ id: 'upload.clickPrompt', message: 'or click to select' })}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
          onChange={handleFileChange}
          accept={acceptedExtensions[selectedFormat]}
          multiple={true}
        />
      </StyledDropArea>
      {files.length > 0 && (
        <StyledFileList>
          {files.map((file, index) => (
            <StyledFileItem key={`${file.name}-${index}`}>
              <StyledFileInfo>
                <StyledFileName>{file.name}</StyledFileName>
                <StyledFileDetails>
                  {file.type ||
                    t({
                      id: 'upload.unknownType',
                      message: 'Unknown type',
                    })}{' '}
                  • {formatFileSize(file.size)}
                </StyledFileDetails>
              </StyledFileInfo>
              <Button
                variant="tertiary"
                size="small"
                Icon={IconTrash}
                title={t({ id: 'upload.removeFile', message: 'Remove' })}
                onClick={() => handleRemoveFile(index)}
              />
            </StyledFileItem>
          ))}
        </StyledFileList>
      )}
      <StyledNavigationButtons>
        <Button
          Icon={IconArrowLeft}
          title={t({
            id: 'upload.backCsv',
            message: 'Back to Format Selection',
          })}
          variant="secondary"
          onClick={onBack}
        />
        <Button
          Icon={IconArrowRight}
          title={t({
            id: 'upload.nextSettings',
            message: 'Continue to Settings',
          })}
          accent="blue"
          disabled={files.length === 0}
          onClick={handleNextClick}
        />
      </StyledNavigationButtons>
    </StyledUploadContainer>
  );
};
