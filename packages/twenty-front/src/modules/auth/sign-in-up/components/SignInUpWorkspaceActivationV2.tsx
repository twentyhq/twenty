import { SubTitle } from '@/auth/components/SubTitle';
import { WORKSPACE_ACTIVATION_MESSAGES } from '@/auth/sign-in-up/constants/WorkspaceActivationMessages';
import { signInUpWorkspaceActivationMessageIndexState } from '@/auth/states/signInUpWorkspaceActivationMessageIndexState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { motion, useReducedMotion } from 'framer-motion';
import { useContext } from 'react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const STEP_OPACITIES = [1, 0.4, 0.12];
const VISIBLE_STEP_COUNT = STEP_OPACITIES.length;
const STEP_HEIGHT_IN_PX = 28;
const STEPS_CONTAINER_HEIGHT_IN_PX = STEP_HEIGHT_IN_PX * VISIBLE_STEP_COUNT;

const StyledLogo = styled.img`
  animation: signInUpWorkspaceActivationLogoPulse 0.8s ease-in-out infinite
    alternate;
  height: ${themeCssVariables.spacing[12]};
  margin-bottom: ${themeCssVariables.spacing[8]};
  width: ${themeCssVariables.spacing[12]};

  @keyframes signInUpWorkspaceActivationLogoPulse {
    from {
      opacity: 1;
    }
    to {
      opacity: 0.4;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 1;
  }
`;

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

export const SignInUpWorkspaceActivationV2 = () => {
  const { i18n } = useLingui();
  const { theme } = useContext(ThemeContext);
  const shouldReduceMotion = useReducedMotion();
  const signInUpWorkspaceActivationMessageIndex = useAtomStateValue(
    signInUpWorkspaceActivationMessageIndexState,
  );

  const messages = WORKSPACE_ACTIVATION_MESSAGES.map((message) =>
    i18n._(message),
  );

  return (
    <>
      <StyledLogo src="/images/integrations/twenty-logo.svg" alt="" />
      <StyledStepsContainer>
        {messages.map((message, index) => {
          const stepOffset = index - signInUpWorkspaceActivationMessageIndex;
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
    </>
  );
};
