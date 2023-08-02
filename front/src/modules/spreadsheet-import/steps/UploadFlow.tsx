import { useCallback, useState } from 'react';
import { Progress } from '@chakra-ui/react';
import type XLSX from 'xlsx-ugnis';

import { useSnackBar } from '@/ui/snack-bar/hooks/useSnackBar';

import { useRsi } from '../hooks/useRsi';
import type { RawData } from '../types';
import { exceedsMaxRecords } from '../utils/exceedsMaxRecords';
import { mapWorkbook } from '../utils/mapWorkbook';

import { MatchColumnsStep } from './MatchColumnsStep/MatchColumnsStep';
import { SelectHeaderStep } from './SelectHeaderStep/SelectHeaderStep';
import { SelectSheetStep } from './SelectSheetStep/SelectSheetStep';
import { UploadStep } from './UploadStep/UploadStep';
import { ValidationStep } from './ValidationStep/ValidationStep';

export enum StepType {
  upload = 'upload',
  selectSheet = 'selectSheet',
  selectHeader = 'selectHeader',
  matchColumns = 'matchColumns',
  validateData = 'validateData',
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
    };

interface Props {
  nextStep: () => void;
}

export const UploadFlow = ({ nextStep }: Props) => {
  const { initialStepState } = useRsi();
  const [state, setState] = useState<StepState>(
    initialStepState || { type: StepType.upload },
  );
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const {
    maxRecords,
    translations,
    uploadStepHook,
    selectHeaderStepHook,
    matchColumnsStepHook,
  } = useRsi();
  const { enqueueSnackBar } = useSnackBar();

  const errorToast = useCallback(
    (description: string) => {
      enqueueSnackBar(translations.alerts.toast.error, {
        variant: 'error',
      });
    },
    [enqueueSnackBar, translations],
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
                  translations.uploadStep.maxRecordsExceeded(
                    maxRecords.toString(),
                  ),
                );
                return;
              }
              try {
                const mappedWorkbook = await uploadStepHook(
                  mapWorkbook(workbook),
                );
                setState({
                  type: StepType.selectHeader,
                  data: mappedWorkbook,
                });
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
                translations.uploadStep.maxRecordsExceeded(
                  maxRecords.toString(),
                ),
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
      return <ValidationStep initialData={state.data} file={uploadedFile!} />;
    default:
      return <Progress isIndeterminate />;
  }
};
