import { styled } from '@linaria/react';
import { Dialog } from 'twenty-ui/primitives/surfaces';
import { useSpreadsheetImportInitialStep } from '@/spreadsheet-import/hooks/useSpreadsheetImportInitialStep';
import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';

import { StepBar } from '@/ui/navigation/step-bar/components/StepBar';
import { useStepBar } from '@/ui/navigation/step-bar/hooks/useStepBar';

import { spreadsheetImportDialogState } from '@/spreadsheet-import/states/spreadsheetImportDialogState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { SpreadsheetImportStepper } from './SpreadsheetImportStepper';

const StyledImportHeader = styled(Dialog.Header)`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  flex-direction: row;
  height: 60px;
  padding: 0 ${themeCssVariables.spacing[30]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding-inline: ${themeCssVariables.spacing[4]};
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
      <StyledImportHeader>
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
      </StyledImportHeader>
      <SpreadsheetImportStepper nextStep={nextStep} prevStep={prevStep} />
    </>
  );
};
