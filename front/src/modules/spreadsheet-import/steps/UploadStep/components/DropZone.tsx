import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Button, Text, useStyleConfig, useToast } from '@chakra-ui/react';
import * as XLSX from 'xlsx-ugnis';

import { useRsi } from '../../../hooks/useRsi';
import type { themeOverrides } from '../../../theme';
import { getDropZoneBorder } from '../utils/getDropZoneBorder';
import { readFileAsync } from '../utils/readFilesAsync';

type DropZoneProps = {
  onContinue: (data: XLSX.WorkBook, file: File) => void;
  isLoading: boolean;
};

export const DropZone = ({ onContinue, isLoading }: DropZoneProps) => {
  const { translations, maxFileSize, dateFormat, parseRaw } = useRsi();
  const styles = useStyleConfig(
    'UploadStep',
  ) as (typeof themeOverrides)['components']['UploadStep']['baseStyle'];
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    noClick: true,
    noKeyboard: true,
    maxFiles: 1,
    maxSize: maxFileSize,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        '.xlsx',
      ],
      'text/csv': ['.csv'],
    },
    onDropRejected: (fileRejections) => {
      setLoading(false);
      fileRejections.forEach((fileRejection) => {
        toast({
          status: 'error',
          variant: 'left-accent',
          position: 'bottom-left',
          title: `${fileRejection.file.name} ${translations.uploadStep.dropzone.errorToastDescription}`,
          description: fileRejection.errors[0].message,
          isClosable: true,
        });
      });
    },
    onDropAccepted: async ([file]) => {
      setLoading(true);
      const arrayBuffer = await readFileAsync(file);
      const workbook = XLSX.read(arrayBuffer, {
        cellDates: true,
        dateNF: dateFormat,
        raw: parseRaw,
        dense: true,
      });
      setLoading(false);
      onContinue(workbook, file);
    },
  });

  return (
    <Box
      {...getRootProps()}
      {...getDropZoneBorder(styles.dropZoneBorder)}
      width="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      flex={1}
    >
      <input {...getInputProps()} data-testid="rsi-dropzone" />
      {isDragActive ? (
        <Text sx={styles.dropzoneText}>
          {translations.uploadStep.dropzone.activeDropzoneTitle}
        </Text>
      ) : loading || isLoading ? (
        <Text sx={styles.dropzoneText}>
          {translations.uploadStep.dropzone.loadingTitle}
        </Text>
      ) : (
        <>
          <Text sx={styles.dropzoneText}>
            {translations.uploadStep.dropzone.title}
          </Text>
          <Button sx={styles.dropzoneButton} onClick={open}>
            {translations.uploadStep.dropzone.buttonTitle}
          </Button>
        </>
      )}
    </Box>
  );
};
