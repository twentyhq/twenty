import { t } from '@lingui/core/macro';
import styled from '@emotion/styled';
import { useCallback, useState } from 'react';
import { type WorkBook } from 'xlsx-ugnis';

import { Modal } from '@/ui/layout/modal/components/Modal';

import { useComputeColumnSuggestionsAndAutoMatch } from '@/spreadsheet-import/hooks/useComputeColumnSuggestionsAndAutoMatch';
import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import { type SpreadsheetImportStep } from '@/spreadsheet-import/steps/types/SpreadsheetImportStep';
import { SpreadsheetImportStepType } from '@/spreadsheet-import/steps/types/SpreadsheetImportStepType';
import { exceedsMaxRecords } from '@/spreadsheet-import/utils/exceedsMaxRecords';
import { mapWorkbook } from '@/spreadsheet-import/utils/mapWorkbook';
import { DropZone } from './components/DropZone';

const StyledContent = styled(Modal.Content)`
  padding: ${({ theme }) => theme.spacing(6)};
`;

type UploadStepProps = {
  setUploadedFile: (file: File) => void;
  setCurrentStepState: (data: any) => void;
  onError: (message: string) => void;
  nextStep: () => void;
  setPreviousStepState: (data: any) => void;
  currentStepState: SpreadsheetImportStep;
};

export const UploadStep = ({
  setUploadedFile,
  setCurrentStepState,
  onError,
  nextStep,
  setPreviousStepState,
  currentStepState,
}: UploadStepProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { maxRecords, uploadStepHook, selectHeaderStepHook, selectHeader } =
    useSpreadsheetImportInternal();

  const computeColumnSuggestionsAndAutoMatch =
    useComputeColumnSuggestionsAndAutoMatch();

  const handleContinue = useCallback(
    async (workbook: WorkBook, file: File) => {
      setUploadedFile(file);
      const isSingleSheet = workbook.SheetNames.length === 1;
      if (isSingleSheet) {
        if (
          maxRecords > 0 &&
          exceedsMaxRecords(workbook.Sheets[workbook.SheetNames[0]], maxRecords)
        ) {
          const maxRecordsString = maxRecords.toString();
          onError(t`Too many records. Up to ${maxRecordsString} allowed`);
          return;
        }
        try {
          const mappedWorkbook = await uploadStepHook(mapWorkbook(workbook));

          if (selectHeader) {
            setCurrentStepState({
              type: SpreadsheetImportStepType.selectHeader,
              data: mappedWorkbook,
            });
          } else {
            // Automatically select first row as header
            const trimmedData = mappedWorkbook.slice(1);

            const { importedRows: data, headerRow: headerValues } =
              await selectHeaderStepHook(mappedWorkbook[0], trimmedData);

            await computeColumnSuggestionsAndAutoMatch({
              headerValues,
              data,
            });

            setCurrentStepState({
              type: SpreadsheetImportStepType.matchColumns,
              data,
              headerValues,
            });
          }
        } catch (e) {
          onError((e as Error).message);
        }
      } else {
        setCurrentStepState({
          type: SpreadsheetImportStepType.selectSheet,
          workbook,
        });
      }
      setPreviousStepState(currentStepState);
      nextStep();
    },
    [
      onError,
      maxRecords,
      nextStep,
      selectHeader,
      selectHeaderStepHook,
      setPreviousStepState,
      setCurrentStepState,
      setUploadedFile,
      currentStepState,
      uploadStepHook,
      computeColumnSuggestionsAndAutoMatch,
    ],
  );

  const handleOnContinue = useCallback(
    async (data: WorkBook, file: File) => {
      setIsLoading(true);
      await handleContinue(data, file);
      setIsLoading(false);
    },
    [handleContinue],
  );

  return (
    <StyledContent>
      <DropZone onContinue={handleOnContinue} isLoading={isLoading} />
    </StyledContent>
  );
};
