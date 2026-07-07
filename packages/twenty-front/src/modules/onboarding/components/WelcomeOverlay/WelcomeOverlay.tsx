import { styled } from '@linaria/react';
import { type Variants, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { HalftoneLogo } from '@/onboarding/components/WelcomeOverlay/HalftoneLogo';
import { WelcomeWorkspaceChip } from '@/onboarding/components/WelcomeOverlay/WelcomeWorkspaceChip';
import { welcomeAnimationVisibleState } from '@/onboarding/states/welcomeAnimationVisibleState';
import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

const WELCOME_HOLD_DURATION_MS = 2800;
const WELCOME_TITLE_WORDS = ['Welcome', 'to', 'your', 'workspace'];

const StyledOverlay = styled(motion.div)`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  bottom: 0;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[8]};
  justify-content: center;
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
  z-index: ${RootStackingContextZIndices.WelcomeOverlay};
`;

const StyledHalftoneWrapper = styled(motion.div)`
  width: 260px;
`;

const StyledTitle = styled(motion.div)`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex-wrap: wrap;
  font-size: 26px;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[2]};
  justify-content: center;
  max-width: 480px;
  padding: 0 ${themeCssVariables.spacing[6]};
`;

const StyledWord = styled(motion.span)`
  display: inline-flex;
`;

const getTitleVariants = (prefersReducedMotion: boolean): Variants => ({
  hidden: {},
  show: {
    transition: {
      delayChildren: prefersReducedMotion ? 0 : 0.85,
      staggerChildren: prefersReducedMotion ? 0 : 0.07,
    },
  },
});

const getWordVariants = (prefersReducedMotion: boolean): Variants => ({
  hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
});

export const WelcomeOverlay = () => {
  const welcomeAnimationVisible = useAtomStateValue(
    welcomeAnimationVisibleState,
  );
  const setWelcomeAnimationVisible = useSetAtomState(
    welcomeAnimationVisibleState,
  );
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (!welcomeAnimationVisible) {
      return;
    }

    const timer = setTimeout(
      () => setIsLeaving(true),
      WELCOME_HOLD_DURATION_MS,
    );

    return () => clearTimeout(timer);
  }, [welcomeAnimationVisible]);

  if (!welcomeAnimationVisible) {
    return null;
  }

  const handleSkip = () => setIsLeaving(true);

  const handleOverlayAnimationComplete = () => {
    if (isLeaving) {
      setWelcomeAnimationVisible(false);
      setIsLeaving(false);
    }
  };

  const titleVariants = getTitleVariants(prefersReducedMotion);
  const wordVariants = getWordVariants(prefersReducedMotion);

  return createPortal(
    <StyledOverlay
      role="presentation"
      onClick={handleSkip}
      initial={{ opacity: 1 }}
      animate={{ opacity: isLeaving ? 0 : 1 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      onAnimationComplete={handleOverlayAnimationComplete}
    >
      <StyledHalftoneWrapper
        initial={
          prefersReducedMotion
            ? { opacity: 0 }
            : { opacity: 0, scale: 0.2, clipPath: 'circle(0% at 50% 50%)' }
        }
        animate={
          prefersReducedMotion
            ? { opacity: 1 }
            : { opacity: 1, scale: 1, clipPath: 'circle(72% at 50% 50%)' }
        }
        transition={{
          duration: prefersReducedMotion ? 0.4 : 1.1,
          ease: prefersReducedMotion ? 'easeOut' : [0.34, 1.56, 0.64, 1],
        }}
      >
        <HalftoneLogo />
      </StyledHalftoneWrapper>
      <StyledTitle variants={titleVariants} initial="hidden" animate="show">
        {WELCOME_TITLE_WORDS.map((word) => (
          <StyledWord key={word} variants={wordVariants}>
            {word}
          </StyledWord>
        ))}
        <StyledWord variants={wordVariants}>
          <WelcomeWorkspaceChip />
        </StyledWord>
      </StyledTitle>
    </StyledOverlay>,
    document.body,
  );
};
