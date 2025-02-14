import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useCallback, useState } from 'react';

import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { CircularProgressBar } from 'twenty-ui';

import { SpreadsheetImportStep } from '@/spreadsheet-import/steps/types/SpreadsheetImportStep';
import { SpreadsheetImportStepType } from '@/spreadsheet-import/steps/types/SpreadsheetImportStepType';
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

type SpreadsheetImportStepperProps = {
  nextStep: () => void;
  prevStep: () => void;
};

export const SpreadsheetImportStepper = ({
  nextStep,
  prevStep,
}: SpreadsheetImportStepperProps) => {
  const theme = useTheme();

  const { initialStepState } = useSpreadsheetImportInternal();

  const [currentStepState, setCurrentStepState] =
    useState<SpreadsheetImportStep>(
      initialStepState || { type: SpreadsheetImportStepType.upload },
    );
  const [previousStepState, setPreviousStepState] =
    useState<SpreadsheetImportStep>(
      initialStepState || { type: SpreadsheetImportStepType.upload },
    );

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const { enqueueSnackBar } = useSnackBar();

  const handleError = useCallback(
    (description: string) => {
      enqueueSnackBar(description, {
        variant: SnackBarVariant.Error,
      });
    },
    [enqueueSnackBar],
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
        throw new Error('File not found');
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
              initialStepState || { type: SpreadsheetImportStepType.upload },
            );
          }}
        />
      );
    case SpreadsheetImportStepType.loading:
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
