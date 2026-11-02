import { EASE_OUT } from '@/ui/theme/constants/EaseOut';
import { styled } from '@linaria/react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTheme } from 'twenty-ui/theme';

const ROLL_OFFSET_PERCENT = 60;

const StyledContainer = styled.span`
  display: inline-flex;
  position: relative;
`;

type GettingStartedRollingTextProps = {
  text: string;
};

export const GettingStartedRollingText = ({
  text,
}: GettingStartedRollingTextProps) => {
  const theme = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const rollOffsetPercent = shouldReduceMotion ? 0 : ROLL_OFFSET_PERCENT;

  return (
    <StyledContainer>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={text}
          initial={{ opacity: 0, y: `${rollOffsetPercent}%` }}
          animate={{ opacity: 1, y: '0%' }}
          exit={{ opacity: 0, y: `${-rollOffsetPercent}%` }}
          transition={{
            duration: theme.animation.duration.normal,
            ease: EASE_OUT,
          }}
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </StyledContainer>
  );
};
