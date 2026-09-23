import { styled } from '@linaria/react';
import { motion, useReducedMotion } from 'framer-motion';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const PROGRESS_BAR_WIDTH_PX = 64;
const PROGRESS_BAR_EASE = [0.2, 0, 0, 1] as const;

const StyledTrack = styled(motion.span)`
  background-color: ${themeCssVariables.background.quaternary};
  border-radius: ${themeCssVariables.border.radius.pill};
  corner-shape: round;
  display: block;
  flex-shrink: 0;
  height: 6px;
  overflow: hidden;
  position: relative;
  transition: background-color
    calc(${themeCssVariables.animation.duration.normal} * 1s);

  &[data-highlighted='true'] {
    background-color: ${themeCssVariables.background.primary};
  }
`;

const StyledSegment = styled(motion.span)`
  border-radius: ${themeCssVariables.border.radius.pill};
  bottom: 0;
  corner-shape: round;
  left: 0;
  position: absolute;
  top: 0;
`;

const StyledLeftToEarnSegment = styled(StyledSegment)`
  background: repeating-linear-gradient(
    135deg,
    ${themeCssVariables.color.green4} 0 3px,
    ${themeCssVariables.color.green3} 3px 6px
  );
`;

const StyledPendingSegment = styled(StyledSegment)`
  background: repeating-linear-gradient(
    135deg,
    ${themeCssVariables.color.green9} 0 2px,
    ${themeCssVariables.color.green4} 2px 4px
  );
`;

const StyledEarnedSegment = styled(StyledSegment)`
  background-color: ${themeCssVariables.color.green9};
`;

type OnboardingFreeCreditsProgressBarProps = {
  earnedCredits: number;
  pendingCredits: number;
  creditsLeftInStep: number;
  goalCredits: number;
  previouslySeenCredits: number;
  isHighlighted: boolean;
};

export const OnboardingFreeCreditsProgressBar = ({
  earnedCredits,
  pendingCredits,
  creditsLeftInStep,
  goalCredits,
  previouslySeenCredits,
  isHighlighted,
}: OnboardingFreeCreditsProgressBarProps) => {
  const shouldReduceMotion = useReducedMotion();

  const toWidth = (credits: number) =>
    `${Math.min(100, Math.max(0, (credits / goalCredits) * 100))}%`;

  // The bar grows first, then replays the credits that just landed, then
  // shows what the current step can still add.
  const getTransition = (delay: number, duration: number) =>
    shouldReduceMotion
      ? { duration: 0 }
      : { delay, duration, ease: PROGRESS_BAR_EASE };

  const previouslySeenWidth = toWidth(
    Math.min(previouslySeenCredits, earnedCredits),
  );

  return (
    <StyledTrack
      aria-hidden
      data-highlighted={isHighlighted}
      initial={{ width: shouldReduceMotion ? PROGRESS_BAR_WIDTH_PX : 0 }}
      animate={{ width: PROGRESS_BAR_WIDTH_PX }}
      transition={getTransition(0, 0.45)}
    >
      <StyledLeftToEarnSegment
        initial={{ width: previouslySeenWidth }}
        animate={{
          width: toWidth(earnedCredits + pendingCredits + creditsLeftInStep),
        }}
        transition={getTransition(0.7, 0.4)}
      />
      <StyledPendingSegment
        initial={{ width: previouslySeenWidth }}
        animate={{ width: toWidth(earnedCredits + pendingCredits) }}
        transition={getTransition(0.2, 0.5)}
      />
      <StyledEarnedSegment
        initial={{ width: previouslySeenWidth }}
        animate={{ width: toWidth(earnedCredits) }}
        transition={getTransition(0.2, 0.5)}
      />
    </StyledTrack>
  );
};
