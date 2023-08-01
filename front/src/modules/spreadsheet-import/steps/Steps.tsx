import { CgCheck } from 'react-icons/cg';

import { Modal } from '@/ui/modal/components/Modal';
// import { Step, Steps as Stepper, useSteps } from 'chakra-ui-steps';
import { StepBar } from '@/ui/step-bar/components/StepBar';
import { useStepBar } from '@/ui/step-bar/hooks/useStepBar';

import { useRsi } from '../hooks/useRsi';
import { useRsiInitialStep } from '../hooks/useRsiInitialStep';

import { UploadFlow } from './UploadFlow';

const CheckIcon = ({ color }: { color: string }) => (
  <CgCheck size="2.25rem" color={color} />
);

export const Steps = () => {
  const { initialStepState, translations } = useRsi();

  const { steps, initialStep } = useRsiInitialStep(initialStepState?.type);

  const { nextStep, activeStep } = useStepBar({
    initialStep,
  });

  console.log('activeStep: ', activeStep);

  return (
    <>
      <Modal.Header>
        <StepBar activeStep={activeStep} icon={<CheckIcon color="#ff0000" />}>
          {steps.map((key) => (
            <StepBar.Step label={translations[key].title} key={key} />
          ))}
        </StepBar>
      </Modal.Header>
      <UploadFlow nextStep={nextStep} />
    </>
  );
};
