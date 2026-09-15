import { SubTitle } from '@/auth/components/SubTitle';
import { useOnboardingMotionTransition } from '@/onboarding/hooks/useOnboardingMotionTransition';
import { type OnboardingActivationMessage } from '@/onboarding/types/OnboardingActivationMessage';
import { styled } from '@linaria/react';
import { motion } from 'framer-motion';

const STEP_OPACITIES = [1, 0.4, 0.12];
const VISIBLE_STEP_COUNT = STEP_OPACITIES.length;
const STEP_HEIGHT_IN_PX = 28;
const STEPS_CONTAINER_HEIGHT_IN_PX = STEP_HEIGHT_IN_PX * VISIBLE_STEP_COUNT;

const StyledStepsContainer = styled.div`
  height: ${STEPS_CONTAINER_HEIGHT_IN_PX}px;
  position: relative;
  width: 100%;
`;

const StyledStepBase = styled.div`
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
`;

const StyledStep = motion.create(StyledStepBase);

type OnboardingActivationStepsProps = {
  messages: OnboardingActivationMessage[];
  messageIndex: number;
};

export const OnboardingActivationSteps = ({
  messages,
  messageIndex,
}: OnboardingActivationStepsProps) => {
  const transition = useOnboardingMotionTransition();

  return (
    <StyledStepsContainer>
      {messages.map((message, index) => {
        const stepOffset = index - messageIndex;
        const isVisible = stepOffset >= 0 && stepOffset < VISIBLE_STEP_COUNT;

        return (
          <StyledStep
            key={message.id}
            initial={false}
            animate={{
              opacity: isVisible ? STEP_OPACITIES[stepOffset] : 0,
              y: stepOffset * STEP_HEIGHT_IN_PX,
            }}
            transition={transition}
          >
            <SubTitle>{message.content}</SubTitle>
          </StyledStep>
        );
      })}
    </StyledStepsContainer>
  );
};
