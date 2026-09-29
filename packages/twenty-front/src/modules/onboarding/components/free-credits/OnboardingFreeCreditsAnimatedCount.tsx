import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { formatOnboardingCredits } from '@/onboarding/utils/formatOnboardingCredits';
import { EASE_OUT } from '@/ui/theme/constants/EaseOut';
import { styled } from '@linaria/react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { useTheme } from 'twenty-ui/theme';

const ROLL_OFFSET_PERCENT = 60;

const StyledContainer = styled.span`
  display: inline-flex;
  position: relative;
`;

type OnboardingFreeCreditsAnimatedCountProps = {
  credits: number;
};

export const OnboardingFreeCreditsAnimatedCount = ({
  credits,
}: OnboardingFreeCreditsAnimatedCountProps) => {
  const theme = useTheme();
  const { numberFormat } = useNumberFormat();
  const shouldReduceMotion = useReducedMotion();
  const [previousCredits, setPreviousCredits] = useState(credits);
  const [rollDirection, setRollDirection] = useState(1);

  if (credits !== previousCredits) {
    setRollDirection(credits > previousCredits ? 1 : -1);
    setPreviousCredits(credits);
  }

  const rollOffsetPercent = shouldReduceMotion ? 0 : ROLL_OFFSET_PERCENT;

  return (
    <StyledContainer>
      <AnimatePresence initial={false} mode="popLayout" custom={rollDirection}>
        <motion.span
          key={credits}
          custom={rollDirection}
          variants={{
            enter: (direction: number) => ({
              opacity: 0,
              y: `${direction * rollOffsetPercent}%`,
            }),
            center: { opacity: 1, y: '0%' },
            exit: (direction: number) => ({
              opacity: 0,
              y: `${-direction * rollOffsetPercent}%`,
            }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            duration: theme.animation.duration.normal,
            ease: EASE_OUT,
          }}
        >
          {formatOnboardingCredits(credits, numberFormat)}
        </motion.span>
      </AnimatePresence>
    </StyledContainer>
  );
};
