import { useCallback, useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import type XLSX from 'xlsx-ugnis';

import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import type { RawData } from '@/spreadsheet-import/types';
import { exceedsMaxRecords } from '@/spreadsheet-import/utils/exceedsMaxRecords';
import { mapWorkbook } from '@/spreadsheet-import/utils/mapWorkbook';
import { Modal } from '@/ui/modal/components/Modal';
import { CircularProgressBar } from '@/ui/progress-bar/components/CircularProgressBar';
import { useSnackBar } from '@/ui/snack-bar/hooks/useSnackBar';

import { MatchColumnsStep } from './MatchColumnsStep/MatchColumnsStep';
import { SelectHeaderStep } from './SelectHeaderStep/SelectHeaderStep';
import { SelectSheetStep } from './SelectSheetStep/SelectSheetStep';
import { UploadStep } from './UploadStep/UploadStep';
import { ValidationStep } from './ValidationStep/ValidationStep';

const StyledProgressBarContainer = styled(Modal.Content)`
  align-items: center;
  display: flex;
  justify-content: center;
`;

export enum StepType {
  upload = 'upload',
  selectSheet = 'selectSheet',
  selectHeader = 'selectHeader',
  matchColumns = 'matchColumns',
  validateData = 'validateData',
  loading = 'loading',
}
export type StepState =
  | {
      type: StepType.upload;
    }
  | {
      type: StepType.selectSheet;
      workbook: XLSX.WorkBook;
    }
  | {
      type: StepType.selectHeader;
      data: RawData[];
    }
  | {
      type: StepType.matchColumns;
      data: RawData[];
      headerValues: RawData;
    }
  | {
      type: StepType.validateData;
      data: any[];
    }
  | {
      type: StepType.loading;
    };

interface Props {
  nextStep: () => void;
}

export const UploadFlow = ({ nextStep }: Props) => {
  const theme = useTheme();
  const { initialStepState } = useSpreadsheetImportInternal();
  const [state, setState] = useState<StepState>(
    initialStepState || { type: StepType.upload },
  );
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const {
    maxRecords,
    uploadStepHook,
    selectHeaderStepHook,
    matchColumnsStepHook,
    selectHeader,
  } = useSpreadsheetImportInternal();
  const { enqueueSnackBar } = useSnackBar();

  const errorToast = useCallback(
    (description: string) => {
      enqueueSnackBar(description, {
        title: 'Error',
        variant: 'error',
      });
    },
    [enqueueSnackBar],
  );

  switch (state.type) {
    case StepType.upload:
      return (
        <UploadStep
          onContinue={async (workbook, file) => {
            setUploadedFile(file);
            const isSingleSheet = workbook.SheetNames.length === 1;
            if (isSingleSheet) {
              if (
                maxRecords &&
                exceedsMaxRecords(
                  workbook.Sheets[workbook.SheetNames[0]],
                  maxRecords,
                )
              ) {
                errorToast(
                  `Too many records. Up to ${maxRecords.toString()} allowed`,
                );
                return;
              }
              try {
                const mappedWorkbook = await uploadStepHook(
                  mapWorkbook(workbook),
                );

                if (selectHeader) {
                  setState({
                    type: StepType.selectHeader,
                    data: mappedWorkbook,
                  });
                } else {
                  // Automatically select first row as header
                  const trimmedData = mappedWorkbook.slice(1);

                  const { data, headerValues } = await selectHeaderStepHook(
                    mappedWorkbook[0],
                    trimmedData,
                  );

                  setState({
                    type: StepType.matchColumns,
                    data,
                    headerValues,
                  });
                }
              } catch (e) {
                errorToast((e as Error).message);
              }
            } else {
              setState({ type: StepType.selectSheet, workbook });
            }
            nextStep();
          }}
        />
      );
    case StepType.selectSheet:
      return (
        <SelectSheetStep
          sheetNames={state.workbook.SheetNames}
          onContinue={async (sheetName) => {
            if (
              maxRecords &&
              exceedsMaxRecords(state.workbook.Sheets[sheetName], maxRecords)
            ) {
              errorToast(
                `Too many records. Up to ${maxRecords.toString()} allowed`,
              );
              return;
            }
            try {
              const mappedWorkbook = await uploadStepHook(
                mapWorkbook(state.workbook, sheetName),
              );
              setState({
                type: StepType.selectHeader,
                data: mappedWorkbook,
              });
            } catch (e) {
              errorToast((e as Error).message);
            }
          }}
        />
      );
    case StepType.selectHeader:
      return (
        <SelectHeaderStep
          data={state.data}
          onContinue={async (...args) => {
            try {
              const { data, headerValues } = await selectHeaderStepHook(
                ...args,
              );
              setState({
                type: StepType.matchColumns,
                data,
                headerValues,
              });
              nextStep();
            } catch (e) {
              errorToast((e as Error).message);
            }
          }}
        />
      );
    case StepType.matchColumns:
      return (
        <MatchColumnsStep
          data={state.data}
          headerValues={state.headerValues}
          onContinue={async (values, rawData, columns) => {
            try {
              const data = await matchColumnsStepHook(values, rawData, columns);
              setState({
                type: StepType.validateData,
                data,
              });
              nextStep();
            } catch (e) {
              errorToast((e as Error).message);
            }
          }}
        />
      );
    case StepType.validateData:
      if (!uploadedFile) {
        throw new Error('File not found');
      }
      return (
        <ValidationStep
          initialData={state.data}
          file={uploadedFile}
          onSubmitStart={() =>
            setState({
              type: StepType.loading,
            })
          }
        />
      );
    case StepType.loading:
    default:
      return (
        <StyledProgressBarContainer>
          <CircularProgressBar
            size={80}
            barWidth={8}
            barColor={theme.font.color.primary}
          />
        </StyledProgressBarContainer>
      );
  }
};
