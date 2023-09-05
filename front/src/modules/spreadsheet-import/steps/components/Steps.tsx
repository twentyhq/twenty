import styled from '@emotion/styled';

import { useSpreadsheetImportInitialStep } from '@/spreadsheet-import/hooks/useSpreadsheetImportInitialStep';
import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import { Modal } from '@/ui/modal/components/Modal';
import { StepBar } from '@/ui/step-bar/components/StepBar';
import { useStepBar } from '@/ui/step-bar/hooks/useStepBar';
import { MOBILE_VIEWPORT } from '@/ui/theme/constants/theme';

import { UploadFlow } from './UploadFlow';

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

const stepTitles = {
  uploadStep: 'Upload file',
  matchColumnsStep: 'Match columns',
  validationStep: 'Validate data',
} as const;

export const Steps = () => {
  const { initialStepState } = useSpreadsheetImportInternal();

  const { steps, initialStep } = useSpreadsheetImportInitialStep(
    initialStepState?.type,
  );

  const { nextStep, activeStep } = useStepBar({
    initialStep,
  });

  return (
    <>
      <StyledHeader>
        <StepBar activeStep={activeStep}>
          {steps.map((key) => (
            <StepBar.Step label={stepTitles[key]} key={key} />
          ))}
        </StepBar>
      </StyledHeader>
      <UploadFlow nextStep={nextStep} />
    </>
  );
};
