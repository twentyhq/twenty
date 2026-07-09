import { styled } from '@linaria/react';
import {
  type AnimationEvent,
  type CSSProperties,
  useCallback,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { WelcomeAnimationAutoLeaveEffect } from '@/onboarding/components/WelcomeOverlay/WelcomeAnimationAutoLeaveEffect';
import { WelcomeHalftoneCanvas } from '@/onboarding/components/WelcomeOverlay/WelcomeHalftoneCanvas';
import { WelcomePersonChip } from '@/onboarding/components/WelcomeOverlay/WelcomePersonChip';
import { isWelcomeAnimationVisibleState } from '@/onboarding/states/isWelcomeAnimationVisibleState';
import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

const WELCOME_TITLE_WORDS = ['Welcome', 'to', 'your', 'workspace'];

const StyledOverlay = styled.div`
  align-items: center;
  bottom: 0;
  display: flex;
  justify-content: center;
  left: 0;
  overflow: hidden;
  position: fixed;
  right: 0;
  top: 0;
  z-index: ${RootStackingContextZIndices.WelcomeOverlay};
`;

const StyledBackdrop = styled.div`
  background: ${themeCssVariables.background.primary};
  inset: 0;
  position: absolute;
  will-change: opacity;
  z-index: 0;

  &.is-leaving {
    animation: welcomeBackdropOut 0.7s cubic-bezier(0.5, 0, 0.1, 1) 0.08s
      forwards;
  }

  @keyframes welcomeBackdropOut {
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

const StyledCanvasLayer = styled.div`
  inset: 0;
  position: absolute;
  z-index: 1;
`;

const StyledTitle = styled.div`
  align-items: center;
  animation: welcomeTitleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) 0.8s both;
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
  z-index: 2;

  @keyframes welcomeTitleIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

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
    animation: none;

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
  animation-delay: calc(1.1s + var(--word-index) * 0.07s);
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
  const isWelcomeAnimationVisible = useAtomStateValue(
    isWelcomeAnimationVisibleState,
  );
  const setIsWelcomeAnimationVisible = useSetAtomState(
    isWelcomeAnimationVisibleState,
  );
  const [isLeaving, setIsLeaving] = useState(false);

  const startLeaving = useCallback(() => setIsLeaving(true), []);

  if (!isWelcomeAnimationVisible) {
    return null;
  }

  const handleBackdropAnimationEnd = (
    event: AnimationEvent<HTMLDivElement>,
  ) => {
    if (event.target === event.currentTarget && isLeaving) {
      setIsWelcomeAnimationVisible(false);
      setIsLeaving(false);
    }
  };

  const leavingClassName = isLeaving ? 'is-leaving' : undefined;

  return createPortal(
    <StyledOverlay>
      <WelcomeAnimationAutoLeaveEffect onAutoLeave={startLeaving} />
      <StyledBackdrop
        className={leavingClassName}
        onAnimationEnd={handleBackdropAnimationEnd}
      />
      <StyledCanvasLayer>
        <WelcomeHalftoneCanvas isLeaving={isLeaving} />
      </StyledCanvasLayer>
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
