import styled from '@emotion/styled';

import { useSpreadsheetImportInitialStep } from '@/spreadsheet-import/hooks/useSpreadsheetImportInitialStep';
import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';

import { StepBar } from '@/ui/navigation/step-bar/components/StepBar';
import { useStepBar } from '@/ui/navigation/step-bar/hooks/useStepBar';

import { Modal } from '@/ui/layout/modal/components/Modal';
import { useLingui } from '@lingui/react/macro';
import { SpreadsheetImportStepper } from './SpreadsheetImportStepper';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';

const StyledHeader = styled(Modal.Header)`
  background-color: ${({ theme }) => theme.background.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  height: 60px;
  padding: 0px;
  padding-left: ${({ theme }) => theme.spacing(30)};
  padding-right: ${({ theme }) => theme.spacing(30)};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding-left: ${({ theme }) => theme.spacing(4)};
    padding-right: ${({ theme }) => theme.spacing(4)};
  }
`;

export const SpreadsheetImportStepperContainer = () => {
  const { t } = useLingui();

  const stepTitles = {
    uploadStep: t`Upload file`,
    matchColumnsStep: t`Match columns`,
    validationStep: t`Validate data`,
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
        <StepBar activeStep={activeStep}>
          {steps.map((key) => (
            <StepBar.Step
              activeStep={activeStep}
              label={stepTitles[key]}
              key={key}
            />
          ))}
        </StepBar>
      </StyledHeader>
      <SpreadsheetImportStepper nextStep={nextStep} prevStep={prevStep} />
    </>
  );
};
