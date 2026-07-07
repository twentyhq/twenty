import { styled } from '@linaria/react';
import {
  type AnimationEvent,
  type CSSProperties,
  useEffect,
  useState,
} from 'react';
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

const StyledOverlay = styled.div`
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
  will-change: opacity;
  z-index: ${RootStackingContextZIndices.WelcomeOverlay};

  &.is-leaving {
    animation: welcomeOverlayOut 0.6s cubic-bezier(0.5, 0, 0.1, 1) 0.08s
      forwards;
  }

  @keyframes welcomeOverlayOut {
    to {
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &.is-leaving {
      animation-duration: 0.4s;
      animation-delay: 0s;
    }
  }
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

const StyledHalftoneWrapper = styled.div`
  animation: welcomeHalftoneIn 1.2s cubic-bezier(0.22, 1, 0.36, 1) both;
  flex-shrink: 0;
  width: max(105vw, 130vh);
  will-change: transform;

  &.is-leaving {
    animation: welcomeHalftoneOut 0.66s cubic-bezier(0.5, 0, 0.1, 1) forwards;
  }

  @keyframes welcomeHalftoneIn {
    from {
      transform: scale(0.96);
    }
    to {
      transform: scale(1);
    }
  }

  @keyframes welcomeHalftoneOut {
    from {
      transform: scale(1);
    }
    to {
      transform: scale(1.09);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;

    &.is-leaving {
      animation: none;
    }
  }
`;

const StyledTitle = styled.div`
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

  @media (max-width: 600px) {
    flex-wrap: wrap;
    max-width: 90vw;
  }

  &.is-leaving {
    animation: welcomeTitleOut 0.34s cubic-bezier(0.4, 0, 1, 1) forwards;
  }

  @keyframes welcomeTitleOut {
    to {
      opacity: 0;
      transform: translateY(-10px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &.is-leaving {
      animation-name: welcomeTitleFadeOut;
    }

    @keyframes welcomeTitleFadeOut {
      to {
        opacity: 0;
      }
    }
  }
`;

const StyledWord = styled.span`
  animation: welcomeWordIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: calc(0.9s + var(--word-index) * 0.07s);
  display: inline-flex;

  @keyframes welcomeWordIn {
    from {
      opacity: 0;
      transform: translateY(14px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation-name: welcomeWordFadeIn;
    animation-delay: 0s;

    @keyframes welcomeWordFadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  }
`;

export const WelcomeOverlay = () => {
  const welcomeAnimationVisible = useAtomStateValue(
    welcomeAnimationVisibleState,
  );
  const setWelcomeAnimationVisible = useSetAtomState(
    welcomeAnimationVisibleState,
  );
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (!welcomeAnimationVisible) {
      return;
    }

    const timer = setTimeout(
      () => setIsLeaving(true),
      WELCOME_HOLD_DURATION_MS,
    );

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === 'Escape' ||
        event.key === 'Enter' ||
        event.key === ' '
      ) {
        setIsLeaving(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [welcomeAnimationVisible]);

  if (!welcomeAnimationVisible) {
    return null;
  }

  const handleSkip = () => setIsLeaving(true);

  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && isLeaving) {
      setWelcomeAnimationVisible(false);
      setIsLeaving(false);
    }
  };

  const leavingClassName = isLeaving ? 'is-leaving' : undefined;

  return createPortal(
    <StyledOverlay
      role="presentation"
      onClick={handleSkip}
      onAnimationEnd={handleAnimationEnd}
      className={leavingClassName}
    >
      <StyledHalftoneLayer>
        <StyledHalftoneWrapper className={leavingClassName}>
          <HalftoneLogo />
        </StyledHalftoneWrapper>
      </StyledHalftoneLayer>
      <StyledTitle className={leavingClassName}>
        {WELCOME_TITLE_WORDS.map((word, index) => (
          <StyledWord
            key={word}
            style={{ '--word-index': index } as CSSProperties}
          >
            {word}
          </StyledWord>
        ))}
        <StyledWord
          style={
            { '--word-index': WELCOME_TITLE_WORDS.length } as CSSProperties
          }
        >
          <WelcomePersonChip />
        </StyledWord>
      </StyledTitle>
    </StyledOverlay>,
    document.body,
  );
};
