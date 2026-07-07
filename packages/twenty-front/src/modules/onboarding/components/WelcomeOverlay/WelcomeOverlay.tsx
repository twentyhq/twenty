import { styled } from '@linaria/react';
import { type Variants, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { HalftoneLogo } from '@/onboarding/components/WelcomeOverlay/HalftoneLogo';
import { WelcomePersonChip } from '@/onboarding/components/WelcomeOverlay/WelcomePersonChip';
import { welcomeAnimationVisibleState } from '@/onboarding/states/welcomeAnimationVisibleState';
import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

const WELCOME_HOLD_DURATION_MS = 2900;
const WELCOME_TITLE_WORDS = ['Welcome', 'to', 'your', 'workspace'];

const REVEAL_EASE = [0.22, 1, 0.36, 1] as const;
const SNAP_EASE = [0.16, 1, 0.3, 1] as const;
const EXIT_EASE = [0.5, 0, 0.1, 1] as const;
const TITLE_EXIT_EASE = [0.4, 0, 1, 1] as const;

const StyledOverlay = styled(motion.div)`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  bottom: 0;
  cursor: pointer;
  display: flex;
  justify-content: center;
  left: 0;
  overflow: hidden;
  position: fixed;
  right: 0;
  top: 0;
  z-index: ${RootStackingContextZIndices.WelcomeOverlay};
`;

const StyledHalftoneLayer = styled.div`
  align-items: center;
  bottom: 0;
  display: flex;
  justify-content: center;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
`;

const StyledHalftoneWrapper = styled(motion.div)`
  flex-shrink: 0;
  width: max(105vw, 130vh);
  will-change: transform, opacity;
`;

const StyledTitle = styled(motion.div)`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex-wrap: nowrap;
  font-size: 26px;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[2]};
  justify-content: center;
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[8]};
  position: relative;
  white-space: nowrap;
  will-change: transform, opacity;
  z-index: 1;
`;

const StyledWord = styled(motion.span)`
  display: inline-flex;
`;

const getHalftoneVariants = (prefersReducedMotion: boolean): Variants => ({
  hidden: prefersReducedMotion
    ? { opacity: 0 }
    : { opacity: 0, scale: 0.9, clipPath: 'circle(0% at 50% 50%)' },
  show: prefersReducedMotion
    ? { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } }
    : {
        opacity: 1,
        scale: [0.9, 1, 1.035],
        clipPath: 'circle(72% at 50% 50%)',
        transition: {
          opacity: { duration: 0.6, ease: SNAP_EASE },
          clipPath: { duration: 1.25, ease: REVEAL_EASE },
          scale: { duration: 2.9, times: [0, 0.42, 1], ease: REVEAL_EASE },
        },
      },
  leaving: prefersReducedMotion
    ? { opacity: 0, transition: { duration: 0.4, ease: 'easeOut' } }
    : { scale: 1.09, transition: { duration: 0.66, ease: EXIT_EASE } },
});

const getTitleVariants = (prefersReducedMotion: boolean): Variants => ({
  hidden: {},
  show: {
    transition: {
      delayChildren: prefersReducedMotion ? 0 : 0.55,
      staggerChildren: prefersReducedMotion ? 0 : 0.07,
    },
  },
  leaving: {
    opacity: 0,
    y: prefersReducedMotion ? 0 : -10,
    transition: {
      duration: prefersReducedMotion ? 0.3 : 0.34,
      ease: prefersReducedMotion ? 'easeOut' : TITLE_EXIT_EASE,
    },
  },
});

const getWordVariants = (prefersReducedMotion: boolean): Variants => ({
  hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: SNAP_EASE },
  },
});

const getChipVariants = (prefersReducedMotion: boolean): Variants => ({
  hidden: {
    opacity: 0,
    y: prefersReducedMotion ? 0 : 14,
    scale: prefersReducedMotion ? 1 : 0.94,
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: SNAP_EASE },
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

  const halftoneVariants = getHalftoneVariants(prefersReducedMotion);
  const titleVariants = getTitleVariants(prefersReducedMotion);
  const wordVariants = getWordVariants(prefersReducedMotion);
  const chipVariants = getChipVariants(prefersReducedMotion);
  const animateState = isLeaving ? 'leaving' : 'show';

  return createPortal(
    <StyledOverlay
      role="presentation"
      onClick={handleSkip}
      initial={{ opacity: 1 }}
      animate={{ opacity: isLeaving ? 0 : 1 }}
      transition={{
        duration: isLeaving ? (prefersReducedMotion ? 0.4 : 0.6) : 0,
        ease: prefersReducedMotion ? 'easeOut' : EXIT_EASE,
        delay: isLeaving && !prefersReducedMotion ? 0.08 : 0,
      }}
      onAnimationComplete={handleOverlayAnimationComplete}
    >
      <StyledHalftoneLayer>
        <StyledHalftoneWrapper
          variants={halftoneVariants}
          initial="hidden"
          animate={animateState}
        >
          <HalftoneLogo />
        </StyledHalftoneWrapper>
      </StyledHalftoneLayer>
      <StyledTitle
        variants={titleVariants}
        initial="hidden"
        animate={animateState}
      >
        {WELCOME_TITLE_WORDS.map((word) => (
          <StyledWord key={word} variants={wordVariants}>
            {word}
          </StyledWord>
        ))}
        <StyledWord variants={chipVariants}>
          <WelcomePersonChip />
        </StyledWord>
      </StyledTitle>
    </StyledOverlay>,
    document.body,
  );
};
