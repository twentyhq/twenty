import { styled } from '@linaria/react';
import { type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { WelcomeAnimationAutoLeaveEffect } from '@/onboarding/components/WelcomeOverlay/WelcomeAnimationAutoLeaveEffect';
import { WelcomeAnimationForcedTeardownEffect } from '@/onboarding/components/WelcomeOverlay/WelcomeAnimationForcedTeardownEffect';
import { WelcomeHalftoneCanvas } from '@/onboarding/components/WelcomeOverlay/WelcomeHalftoneCanvas';
import { WelcomePersonChip } from '@/onboarding/components/WelcomeOverlay/WelcomePersonChip';
import { WELCOME_TITLE_SOURCE_ELEMENT_ID } from '@/onboarding/constants/WelcomeTitleSourceElementId';
import { WELCOME_TITLE_WORDS } from '@/onboarding/constants/WelcomeTitleWords';
import { isWelcomeAnimationLeavingState } from '@/onboarding/states/isWelcomeAnimationLeavingState';
import { isWelcomeAnimationVisibleState } from '@/onboarding/states/isWelcomeAnimationVisibleState';
import { welcomeTitleFlightState } from '@/onboarding/states/welcomeTitleFlightState';
import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledOverlay = styled.div`
  align-items: center;
  bottom: 0;
  display: flex;
  justify-content: center;
  left: 0;
  overflow: hidden;
  pointer-events: none;
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

  &.is-flying {
    animation:
      welcomeTitleFlight 0.62s cubic-bezier(0.16, 1, 0.3, 1) forwards,
      welcomeTitleFlightOut 0.14s ease-out 0.66s forwards;
    transform-origin: var(--welcome-flight-origin-x) center;
  }

  @keyframes welcomeTitleFlight {
    to {
      transform: translate(var(--welcome-flight-x), var(--welcome-flight-y))
        scale(var(--welcome-flight-scale));
    }
  }

  @keyframes welcomeTitleFlightOut {
    to {
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;

    &.is-leaving,
    &.is-flying {
      animation: welcomeTitleFadeOut 0.34s ease-out forwards;
    }

    @keyframes welcomeTitleFadeOut {
      to {
        opacity: 0;
      }
    }
  }
`;

const StyledTitleSurface = styled.div`
  background: ${themeCssVariables.background.primary};
  border-radius: ${themeCssVariables.border.radius.pill};
  inset: 0;
  position: absolute;

  .is-flying & {
    animation: welcomeTitleSurfaceOut 0.24s ease-out forwards;
  }

  @keyframes welcomeTitleSurfaceOut {
    to {
      opacity: 0;
    }
  }
`;

const StyledTitleBoldRun = styled.span`
  align-items: center;
  display: inline-flex;
  gap: ${themeCssVariables.spacing[2]};
  white-space: nowrap;

  .is-flying & {
    animation: welcomeTitleBoldRunOut 0.38s ease 0.12s forwards;
  }

  @keyframes welcomeTitleBoldRunOut {
    to {
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .is-flying & {
      animation: none;
    }
  }
`;

// Exact 2x clone of the handoff target run: regular weight, doubled gap and a
// 2x-scaled chip, so the 0.5 flight scale lands it pixel-identical to the
// target. Crossfaded with the bold run mid-flight to morph the font weight.
const StyledTitleRegularRun = styled.span`
  align-items: center;
  display: inline-flex;
  font-weight: ${themeCssVariables.font.weight.regular};
  gap: calc(${themeCssVariables.spacing[2]} * 2);
  left: ${themeCssVariables.spacing[8]};
  line-height: 1.4em;
  opacity: 0;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  white-space: nowrap;

  .is-flying & {
    animation: welcomeTitleRegularRunIn 0.38s ease 0.12s forwards;
  }

  @keyframes welcomeTitleRegularRunIn {
    to {
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .is-flying & {
      animation: none;
    }
  }
`;

const StyledTargetScaleChip = styled.span`
  display: inline-flex;
  font-size: 0.5em;
  line-height: 1.4em;
  transform: scale(2);
  transform-origin: left center;
`;

const StyledWord = styled.span`
  animation: welcomeWordIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: calc(1.1s + var(--word-index) * 0.07s);
  display: inline-flex;
  position: relative;

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
  const isWelcomeAnimationLeaving = useAtomStateValue(
    isWelcomeAnimationLeavingState,
  );
  const welcomeTitleFlight = useAtomStateValue(welcomeTitleFlightState);

  if (!isWelcomeAnimationVisible) {
    return null;
  }

  const leavingClassName = isWelcomeAnimationLeaving ? 'is-leaving' : undefined;
  const titleClassName = isWelcomeAnimationLeaving
    ? isDefined(welcomeTitleFlight)
      ? 'is-flying'
      : 'is-leaving'
    : undefined;

  const titleStyle = isDefined(welcomeTitleFlight)
    ? ({
        '--welcome-flight-x': `${welcomeTitleFlight.translateXInPx}px`,
        '--welcome-flight-y': `${welcomeTitleFlight.translateYInPx}px`,
        '--welcome-flight-scale': welcomeTitleFlight.scale,
        '--welcome-flight-origin-x': `${welcomeTitleFlight.transformOriginXInPx}px`,
      } as CSSProperties)
    : undefined;

  return createPortal(
    <StyledOverlay>
      {isWelcomeAnimationLeaving ? (
        <WelcomeAnimationForcedTeardownEffect />
      ) : (
        <WelcomeAnimationAutoLeaveEffect />
      )}
      <StyledBackdrop className={leavingClassName} />
      <StyledCanvasLayer>
        <WelcomeHalftoneCanvas isLeaving={isWelcomeAnimationLeaving} />
      </StyledCanvasLayer>
      <StyledTitle
        id={WELCOME_TITLE_SOURCE_ELEMENT_ID}
        className={titleClassName}
        style={titleStyle}
      >
        <StyledTitleSurface />
        <StyledTitleBoldRun>
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
        </StyledTitleBoldRun>
        <StyledTitleRegularRun aria-hidden>
          {WELCOME_TITLE_WORDS.join(' ')}
          <StyledTargetScaleChip>
            <WelcomePersonChip avatarSize="xs" sizeVariant="compact" />
          </StyledTargetScaleChip>
        </StyledTitleRegularRun>
      </StyledTitle>
    </StyledOverlay>,
    document.body,
  );
};
