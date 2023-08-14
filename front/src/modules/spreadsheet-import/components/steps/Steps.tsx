import styled from '@emotion/styled';

import { useRsi } from '@/spreadsheet-import/hooks/useRsi';
import { useRsiInitialStep } from '@/spreadsheet-import/hooks/useRsiInitialStep';
import { Modal } from '@/ui/modal/components/Modal';
import { StepBar } from '@/ui/step-bar/components/StepBar';
import { useStepBar } from '@/ui/step-bar/hooks/useStepBar';

import { UploadFlow } from './UploadFlow';

const Header = styled(Modal.Header)`
  background-color: ${({ theme }) => theme.background.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  height: 60px;
  padding: 0px;
  padding-left: ${({ theme }) => theme.spacing(30)};
  padding-right: ${({ theme }) => theme.spacing(30)};
`;

export const Steps = () => {
  const { initialStepState, translations } = useRsi();

  const { steps, initialStep } = useRsiInitialStep(initialStepState?.type);

  const { nextStep, activeStep } = useStepBar({
    initialStep,
  });

  return (
    <>
      <Header>
        <StepBar activeStep={activeStep}>
          {steps.map((key) => (
            <StepBar.Step label={translations[key].title} key={key} />
          ))}
        </StepBar>
      </Header>
      <UploadFlow nextStep={nextStep} />
    </>
  );
};
