import { ONBOARDING_LOST_CREDITS_DISPLAY_DURATION_S } from '@/onboarding/constants/OnboardingLostCreditsDisplayDurationS';
import { ONBOARDING_NEWLY_EARNED_CREDITS_DISPLAY_DURATION_S } from '@/onboarding/constants/OnboardingNewlyEarnedCreditsDisplayDurationS';
import { styled } from '@linaria/react';
import { motion, useReducedMotion } from 'framer-motion';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledChange = styled(motion.span)`
  color: ${themeCssVariables.color.green9};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};

  &[data-lost] {
    color: ${themeCssVariables.font.color.tertiary};
  }
`;

type OnboardingFreeCreditsChangeProps = {
  label: string;
  isLost?: boolean;
  delay: number;
  onDisplayed: () => void;
};

export const OnboardingFreeCreditsChange = ({
  label,
  isLost = false,
  delay,
  onDisplayed,
}: OnboardingFreeCreditsChangeProps) => {
  const theme = useTheme();
  const shouldReduceMotion = useReducedMotion();

  const fadeInDuration = theme.animation.duration.normal;
  const fadeOutDuration = theme.animation.duration.fast;
  const visibleDuration = isLost
    ? ONBOARDING_LOST_CREDITS_DISPLAY_DURATION_S
    : ONBOARDING_NEWLY_EARNED_CREDITS_DISPLAY_DURATION_S;
  const displayDuration = visibleDuration + fadeOutDuration;
  const fadeTimes = [
    0,
    fadeInDuration / displayDuration,
    visibleDuration / displayDuration,
    1,
  ];
  const slideOffset = shouldReduceMotion ? 0 : theme.spacingMultiplicator * 2;

  return (
    <StyledChange
      data-lost={isLost || undefined}
      variants={{
        hidden: {
          opacity: 0,
          scale: shouldReduceMotion ? 1 : 0.6,
          x: slideOffset,
          y: 0,
        },
        displayed: {
          opacity: [0, 1, 1, 0],
          scale: 1,
          x: 0,
          y: [0, 0, 0, -slideOffset],
          transition: {
            opacity: { duration: displayDuration, times: fadeTimes, delay },
            y: { duration: displayDuration, times: fadeTimes, delay },
            scale: { type: 'spring', stiffness: 500, damping: 14, delay },
            x: { duration: fadeInDuration, delay },
          },
        },
        exit: {
          opacity: 0,
          y: -slideOffset,
          transition: { duration: fadeOutDuration },
        },
      }}
      initial="hidden"
      animate="displayed"
      exit="exit"
      onAnimationComplete={(definition) => {
        if (definition === 'displayed') {
          onDisplayed();
        }
      }}
    >
      {label}
    </StyledChange>
  );
};
