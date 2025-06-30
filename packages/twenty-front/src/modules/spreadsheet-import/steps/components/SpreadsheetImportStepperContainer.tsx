import styled from '@emotion/styled';

import { useSpreadsheetImportInitialStep } from '@/spreadsheet-import/hooks/useSpreadsheetImportInitialStep';
import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';

import { StepBar } from '@/ui/navigation/step-bar/components/StepBar';
import { useStepBar } from '@/ui/navigation/step-bar/hooks/useStepBar';

import { spreadsheetImportDialogState } from '@/spreadsheet-import/states/spreadsheetImportDialogState';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';
import { SpreadsheetImportStepper } from './SpreadsheetImportStepper';

const StyledHeader = styled(Modal.Header)`
  background-color: ${({ theme }) => theme.background.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  padding: 0px ${({ theme }) => theme.spacing(30)};
  height: 60px;
  flex-shrink: 0;
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding-left: ${({ theme }) => theme.spacing(4)};
    padding-right: ${({ theme }) => theme.spacing(4)};
  }
`;

export const SpreadsheetImportStepperContainer = () => {
  const { t } = useLingui();

  const spreadsheetImportDialog = useRecoilValue(spreadsheetImportDialogState);

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
