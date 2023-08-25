import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import styled from '@emotion/styled';
import * as XLSX from 'xlsx-ugnis';

import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import { readFileAsync } from '@/spreadsheet-import/utils/readFilesAsync';
import { MainButton } from '@/ui/button/components/MainButton';
import { useSnackBar } from '@/ui/snack-bar/hooks/useSnackBar';

const StyledContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => `
    repeating-linear-gradient(
      0deg,
      ${theme.font.color.primary},
      ${theme.font.color.primary} 10px,
      transparent 10px,
      transparent 20px,
      ${theme.font.color.primary} 20px
    ),
    repeating-linear-gradient(
      90deg,
      ${theme.font.color.primary},
      ${theme.font.color.primary} 10px,
      transparent 10px,
      transparent 20px,
      ${theme.font.color.primary} 20px
    ),
    repeating-linear-gradient(
      180deg,
      ${theme.font.color.primary},
      ${theme.font.color.primary} 10px,
      transparent 10px,
      transparent 20px,
      ${theme.font.color.primary} 20px
    ),
    repeating-linear-gradient(
      270deg,
      ${theme.font.color.primary},
      ${theme.font.color.primary} 10px,
      transparent 10px,
      transparent 20px,
      ${theme.font.color.primary} 20px
    );
  `};
  background-position: 0 0, 0 0, 100% 0, 0 100%;
  background-repeat: no-repeat;
  background-size: 2px 100%, 100% 2px, 2px 100%, 100% 2px;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  position: relative;
`;

const StyledOverlay = styled.div`
  background: ${({ theme }) => theme.background.transparent.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  bottom: 0px;
  left: 0px;
  position: absolute;
  right: 0px;
  top: 0px;
`;

const StyledText = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  text-align: center;
`;

const StyledButton = styled(MainButton)`
  margin-top: ${({ theme }) => theme.spacing(2)};
  width: 200px;
`;

type DropZoneProps = {
  onContinue: (data: XLSX.WorkBook, file: File) => void;
  isLoading: boolean;
};

export const DropZone = ({ onContinue, isLoading }: DropZoneProps) => {
  const { maxFileSize, dateFormat, parseRaw } = useSpreadsheetImportInternal();

  const [loading, setLoading] = useState(false);

  const { enqueueSnackBar } = useSnackBar();

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
        enqueueSnackBar(fileRejection.errors[0].message, {
          title: `${fileRejection.file.name} upload rejected`,
          variant: 'error',
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
    <StyledContainer {...getRootProps()}>
      {isDragActive && <StyledOverlay />}
      <input {...getInputProps()} />
      {isDragActive ? (
        <StyledText>Drop file here...</StyledText>
      ) : loading || isLoading ? (
        <StyledText>Processing...</StyledText>
      ) : (
        <>
          <StyledText>Upload .xlsx, .xls or .csv file</StyledText>
          <StyledButton onClick={open} title="Select file" />
        </>
      )}
    </StyledContainer>
  );
};
