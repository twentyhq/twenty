import { ONBOARDING_CONTENT_BLOCK_WIDTH } from '@/onboarding/constants/OnboardingContentBlockWidth';
import { EASE_OUT_CSS } from '@/ui/theme/constants/EaseOutCss';
import { styled } from '@linaria/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme';

export const StyledAuthCard = styled.div`
  align-items: center;
  animation: auth-card-enter
    calc(${themeCssVariables.animation.duration.fast} * 1.4s) ${EASE_OUT_CSS}
    both;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.xl};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  max-width: calc(
    ${ONBOARDING_CONTENT_BLOCK_WIDTH}px + 2 * ${themeCssVariables.spacing[8]}
  );
  padding: ${themeCssVariables.spacing[6]} ${themeCssVariables.spacing[8]};
  width: 100%;

  @keyframes auth-card-enter {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
  }

  @keyframes auth-card-fade-in {
    from {
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation-name: auth-card-fade-in;
  }

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    border-radius: ${themeCssVariables.border.radius.lg};
    padding: ${themeCssVariables.spacing[4]};
  }
`;
