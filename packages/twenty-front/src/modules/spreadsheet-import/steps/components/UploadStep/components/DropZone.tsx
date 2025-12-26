import styled from '@emotion/styled';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { read, type WorkBook } from 'xlsx-ugnis';

import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { SPREADSHEET_MAX_RECORD_IMPORT_CAPACITY } from '@/spreadsheet-import/constants/SpreadsheetMaxRecordImportCapacity';
import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import { useDownloadFakeRecords } from '@/spreadsheet-import/steps/components/UploadStep/hooks/useDownloadFakeRecords';
import { readFileAsync } from '@/spreadsheet-import/utils/readFilesAsync';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Trans, useLingui } from '@lingui/react/macro';
import { MainButton } from 'twenty-ui/input';

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
  background-position:
    0 0,
    0 0,
    100% 0,
    0 100%;
  background-repeat: no-repeat;
  background-size:
    2px 100%,
    100% 2px,
    2px 100%,
    100% 2px;
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
  padding: 16px;
`;

const StyledFooterText = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  text-align: center;
  position: absolute;
  bottom: ${({ theme }) => theme.spacing(4)};
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
`;

const StyledButtonsContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  max-width: 200px;
  width: 100%;
`;

type DropZoneProps = {
  onContinue: (data: WorkBook, file: File) => void;
  isLoading: boolean;
};

export const DropZone = ({ onContinue, isLoading }: DropZoneProps) => {
  const { maxFileSize, dateFormat, parseRaw } = useSpreadsheetImportInternal();
  const { formatNumber } = useNumberFormat();

  const [loading, setLoading] = useState(false);

  const { enqueueErrorSnackBar } = useSnackBar();

  const { downloadSample } = useDownloadFakeRecords();

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
        const fileName = fileRejection.file.name;
        enqueueErrorSnackBar({
          message: t`${fileName} upload rejected`,
          options: {
            detailedMessage: fileRejection.errors[0].message,
          },
        });
      });
    },
    onDropAccepted: async ([file]) => {
      setLoading(true);
      const arrayBuffer = await readFileAsync(file);
      const workbook = read(arrayBuffer, {
        cellDates: true,
        codepage: 65001, // UTF-8 codepage
        dateNF: dateFormat,
        raw: parseRaw,
        dense: true,
      });
      setLoading(false);
      onContinue(workbook, file);
    },
  });

  const { t } = useLingui();

  const formatSpreadsheetMaxRecordImportCapacity = formatNumber(
    SPREADSHEET_MAX_RECORD_IMPORT_CAPACITY,
  );

  return (
    <StyledContainer
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...getRootProps()}
    >
      {isDragActive && <StyledOverlay />}
      <input
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...getInputProps()}
      />
      {isDragActive ? (
        <StyledText>
          <Trans>Drop file here...</Trans>
        </StyledText>
      ) : loading || isLoading ? (
        <StyledText>
          <Trans>Processing...</Trans>
        </StyledText>
      ) : (
        <>
          <StyledText>
            <Trans>Upload .xlsx, .xls or .csv file</Trans>
          </StyledText>
          <StyledButtonsContainer>
            <MainButton onClick={open} title={t`Select file`} fullWidth />
            <MainButton
              onClick={downloadSample}
              title={t`Download sample`}
              variant="secondary"
              fullWidth
            />
          </StyledButtonsContainer>
          <StyledFooterText>
            {t`Max import capacity: ${formatSpreadsheetMaxRecordImportCapacity} records. Otherwise, consider splitting your file or using the API.`}
          </StyledFooterText>
        </>
      )}
    </StyledContainer>
  );
};
