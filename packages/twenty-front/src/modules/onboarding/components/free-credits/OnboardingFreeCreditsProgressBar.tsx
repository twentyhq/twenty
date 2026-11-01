import { OnboardingFreeCreditsProgressBarReducedMotionEffect } from '@/onboarding/components/free-credits/OnboardingFreeCreditsProgressBarReducedMotionEffect';
import { styled } from '@linaria/react';
import {
  Progress,
  type ProgressRootProps,
} from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledProgressBar = styled.div`
  background-color: ${themeCssVariables.background.transparent.medium};
  border-radius: ${themeCssVariables.border.radius.pill};
  corner-shape: round;
  height: ${themeCssVariables.spacing['1.5']};
  overflow: hidden;
  width: 100%;

  &[data-grow-in] {
    animation: onboardingFreeCreditsProgressBarGrow
      calc(${themeCssVariables.animation.duration.normal} * 1s)
      cubic-bezier(0.2, 0, 0, 1);
  }

  @keyframes onboardingFreeCreditsProgressBarGrow {
    from {
      width: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &[data-grow-in] {
      animation: none;
    }
  }
`;

const StyledTrack = styled.div`
  height: 100%;
`;

const StyledIndicator = styled.div`
  background-color: ${themeCssVariables.color.green9};
  border-radius: ${themeCssVariables.border.radius.pill};
  corner-shape: round;
  height: 100%;
  overflow: hidden;
  position: relative;
  transition: width calc(${themeCssVariables.animation.duration.normal} * 2s)
    linear(
      0,
      0.092,
      0.285,
      0.496,
      0.681,
      0.823,
      0.922,
      0.982,
      1.015,
      1.028,
      1.03,
      1.026,
      1.02,
      1.014,
      1.008,
      1.004,
      1.002,
      1,
      0.999,
      0.999,
      1
    );

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const StyledGlint = styled.span`
  animation: onboardingFreeCreditsProgressBarGlint
    calc(${themeCssVariables.animation.duration.normal} * 3s)
    cubic-bezier(0.2, 0, 0, 1) forwards;
  backdrop-filter: brightness(1.6);
  inset: 0;
  mask-image: linear-gradient(90deg, transparent, black, transparent);
  position: absolute;
  transform: translateX(-100%);

  @keyframes onboardingFreeCreditsProgressBarGlint {
    from {
      transform: translateX(-100%);
    }

    to {
      transform: translateX(100%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    display: none;
  }
`;

type OnboardingFreeCreditsProgressBarProps = Pick<
  ProgressRootProps,
  'value' | 'max' | 'aria-label'
> & {
  hasNewlyEarnedCredits: boolean;
  hasTrackGrown: boolean;
  onTrackGrown: () => void;
};

export const OnboardingFreeCreditsProgressBar = ({
  value,
  max,
  'aria-label': ariaLabel,
  hasNewlyEarnedCredits,
  hasTrackGrown,
  onTrackGrown,
}: OnboardingFreeCreditsProgressBarProps) => {
  return (
    <>
      <Progress.Root
        value={value}
        max={max}
        aria-label={ariaLabel}
        data-grow-in={!hasTrackGrown || undefined}
        onAnimationEnd={({ target, currentTarget }) => {
          if (hasTrackGrown || target !== currentTarget) {
            return;
          }

          onTrackGrown();
        }}
        render={<StyledProgressBar />}
      >
        <Progress.Track render={<StyledTrack />}>
          <Progress.Indicator render={<StyledIndicator />}>
            {hasTrackGrown && hasNewlyEarnedCredits && (
              <StyledGlint key={`${max}:${value}`} aria-hidden />
            )}
          </Progress.Indicator>
        </Progress.Track>
      </Progress.Root>
      <OnboardingFreeCreditsProgressBarReducedMotionEffect
        hasTrackGrown={hasTrackGrown}
        onTrackGrown={onTrackGrown}
      />
    </>
  );
};
