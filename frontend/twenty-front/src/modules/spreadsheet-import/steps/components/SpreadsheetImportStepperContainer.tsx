import { useSpreadsheetImportInitialStep } from '@/spreadsheet-import/hooks/useSpreadsheetImportInitialStep';
import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';

import { StepBar } from '@/ui/navigation/step-bar/components/StepBar';
import { useStepBar } from '@/ui/navigation/step-bar/hooks/useStepBar';

import { spreadsheetImportDialogState } from '@/spreadsheet-import/states/spreadsheetImportDialogState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { ModalHeader } from 'twenty-ui/layout';
import { SpreadsheetImportStepper } from './SpreadsheetImportStepper';

export const SpreadsheetImportStepperContainer = () => {
  const { t } = useLingui();

  const spreadsheetImportDialog = useAtomStateValue(
    spreadsheetImportDialogState,
  );

  const stepTitles = {
    uploadStep: t`Upload File`,
    matchColumnsStep: t`Match Columns`,
    validationStep: t`Validate Data`,
  };

  const { initialStepState } = useSpreadsheetImportInternal();

  const { steps, initialStep } = useSpreadsheetImportInitialStep(
    initialStepState?.type,
  );

  const { nextStep, prevStep, activeStep } = useStepBar({
    initialStep,
  });

  return (
    <>
      <ModalHeader
        hasBorderBottom
        paddingHorizontal={30}
        backgroundColor={themeCssVariables.background.secondary}
      >
        {spreadsheetImportDialog.isStepBarVisible && (
          <StepBar activeStep={activeStep}>
            {steps.map((key) => (
              <StepBar.Step
                activeStep={activeStep}
                label={stepTitles[key]}
                key={key}
              />
            ))}
          </StepBar>
        )}
      </ModalHeader>
      <SpreadsheetImportStepper nextStep={nextStep} prevStep={prevStep} />
    </>
  );
};
