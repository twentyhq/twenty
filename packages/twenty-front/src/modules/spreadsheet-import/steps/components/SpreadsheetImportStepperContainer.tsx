import { styled } from '@linaria/react';

import { useSpreadsheetImportInitialStep } from '@/spreadsheet-import/hooks/useSpreadsheetImportInitialStep';
import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';

import { StepBar } from '@/ui/navigation/step-bar/components/StepBar';
import { useStepBar } from '@/ui/navigation/step-bar/hooks/useStepBar';

import { spreadsheetImportDialogState } from '@/spreadsheet-import/states/spreadsheetImportDialogState';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { SpreadsheetImportStepper } from './SpreadsheetImportStepper';

const StyledHeader = styled(Modal.Header)`
  background-color: ${themeCssVariables.background.secondary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  padding: 0px ${themeCssVariables.spacing[30]};
  height: 60px;
  flex-shrink: 0;
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding-left: ${themeCssVariables.spacing[4]};
    padding-right: ${themeCssVariables.spacing[4]};
  }
`;

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
      <StyledHeader>
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
      </StyledHeader>
      <SpreadsheetImportStepper nextStep={nextStep} prevStep={prevStep} />
    </>
  );
};
