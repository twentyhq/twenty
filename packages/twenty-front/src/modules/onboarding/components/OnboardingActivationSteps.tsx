import { SubTitle } from '@/auth/components/SubTitle';
import { styled } from '@linaria/react';
import { type MessageDescriptor } from '@lingui/core';
import { useLingui } from '@lingui/react/macro';
import { motion, useReducedMotion } from 'framer-motion';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';

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
  messages: MessageDescriptor[];
  messageIndex: number;
};

export const OnboardingActivationSteps = ({
  messages,
  messageIndex,
}: OnboardingActivationStepsProps) => {
  const { i18n } = useLingui();
  const { theme } = useContext(ThemeContext);
  const shouldReduceMotion = useReducedMotion();

  const translatedMessages = messages.map((message) => i18n._(message));

  return (
    <StyledStepsContainer>
      {translatedMessages.map((message, index) => {
        const stepOffset = index - messageIndex;
        const isVisible = stepOffset >= 0 && stepOffset < VISIBLE_STEP_COUNT;

        return (
          <StyledStep
            key={message}
            initial={false}
            animate={{
              opacity: isVisible ? STEP_OPACITIES[stepOffset] : 0,
              y: stepOffset * STEP_HEIGHT_IN_PX,
            }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : {
                    duration: theme.animation.duration.normal,
                    ease: 'easeInOut',
                  }
            }
          >
            <SubTitle>{message}</SubTitle>
          </StyledStep>
        );
      })}
    </StyledStepsContainer>
  );
};
