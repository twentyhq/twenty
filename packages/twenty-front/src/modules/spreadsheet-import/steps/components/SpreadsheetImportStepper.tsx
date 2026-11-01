import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import { ImportDataStep } from '@/spreadsheet-import/steps/components/ImportDataStep';
import { type SpreadsheetImportStep } from '@/spreadsheet-import/steps/types/SpreadsheetImportStep';
import { SpreadsheetImportStepType } from '@/spreadsheet-import/steps/types/SpreadsheetImportStepType';
import { useCallback, useState } from 'react';
import { useToast } from 'twenty-ui/components/feedback';
import { Loader } from 'twenty-ui/primitives/feedback';
import { SpreadsheetImportStepBody } from '@/spreadsheet-import/components/SpreadsheetImportStepBody';
import { MatchColumnsStep } from './MatchColumnsStep/MatchColumnsStep';
import { SelectHeaderStep } from './SelectHeaderStep/SelectHeaderStep';
import { SelectSheetStep } from './SelectSheetStep/SelectSheetStep';
import { UploadStep } from './UploadStep/UploadStep';
import { ValidationStep } from './ValidationStep/ValidationStep';
import { doNotTranslate } from 'twenty-shared/i18n';

type SpreadsheetImportStepperProps = {
  nextStep: () => void;
  prevStep: () => void;
};

export const SpreadsheetImportStepper = ({
  nextStep,
  prevStep,
}: SpreadsheetImportStepperProps) => {
  const { initialStepState } = useSpreadsheetImportInternal();

  const [currentStepState, setCurrentStepState] =
    useState<SpreadsheetImportStep>(
      initialStepState ?? { type: SpreadsheetImportStepType.upload },
    );
  const [previousStepState, setPreviousStepState] =
    useState<SpreadsheetImportStep>(
      initialStepState ?? { type: SpreadsheetImportStepType.upload },
    );

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const { enqueueToast } = useToast();

  const handleError = useCallback(
    (description: string) => {
      enqueueToast({ status: 'error', children: description });
    },
    [enqueueToast],
  );

  const handleBack = useCallback(() => {
    setCurrentStepState(previousStepState);
    prevStep();
  }, [prevStep, previousStepState]);

  switch (currentStepState.type) {
    case SpreadsheetImportStepType.upload:
      return (
        <UploadStep
          setUploadedFile={setUploadedFile}
          currentStepState={currentStepState}
          setPreviousStepState={setPreviousStepState}
          setCurrentStepState={setCurrentStepState}
          onError={handleError}
          nextStep={nextStep}
        />
      );
    case SpreadsheetImportStepType.selectSheet:
      return (
        <SelectSheetStep
          sheetNames={currentStepState.workbook.SheetNames}
          setCurrentStepState={setCurrentStepState}
          currentStepState={currentStepState}
          onError={handleError}
          setPreviousStepState={setPreviousStepState}
          onBack={handleBack}
        />
      );
    case SpreadsheetImportStepType.selectHeader:
      return (
        <SelectHeaderStep
          importedRows={currentStepState.data}
          setCurrentStepState={setCurrentStepState}
          nextStep={nextStep}
          setPreviousStepState={setPreviousStepState}
          onError={handleError}
          onBack={handleBack}
          currentStepState={currentStepState}
        />
      );
    case SpreadsheetImportStepType.matchColumns:
      return (
        <MatchColumnsStep
          data={currentStepState.data}
          headerValues={currentStepState.headerValues}
          setCurrentStepState={setCurrentStepState}
          setPreviousStepState={setPreviousStepState}
          currentStepState={currentStepState}
          nextStep={nextStep}
          onBack={handleBack}
          onError={handleError}
        />
      );
    case SpreadsheetImportStepType.validateData:
      if (!uploadedFile) {
        throw new Error(doNotTranslate('File not found'));
      }
      return (
        <ValidationStep
          initialData={currentStepState.data}
          importedColumns={currentStepState.importedColumns}
          file={uploadedFile}
          setCurrentStepState={setCurrentStepState}
          onBack={() => {
            handleBack();
            setPreviousStepState(
              initialStepState ?? { type: SpreadsheetImportStepType.upload },
            );
          }}
        />
      );
    case SpreadsheetImportStepType.importData:
      return (
        <ImportDataStep
          recordsToImportCount={currentStepState.recordsToImportCount}
        />
      );
    case SpreadsheetImportStepType.loading:
    default:
      return (
        <SpreadsheetImportStepBody
          padding="large"
          isCenteredHorizontally
          isCenteredVertically
        >
          <Loader />
        </SpreadsheetImportStepBody>
      );
  }
};
