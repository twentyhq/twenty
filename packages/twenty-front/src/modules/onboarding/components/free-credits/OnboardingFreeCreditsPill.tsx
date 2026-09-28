import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { OnboardingFreeCreditsChange } from '@/onboarding/components/free-credits/OnboardingFreeCreditsChange';
import { OnboardingFreeCreditsProgress } from '@/onboarding/components/free-credits/OnboardingFreeCreditsProgress';
import { StyledOnboardingFreeCreditsCount } from '@/onboarding/components/free-credits/StyledOnboardingFreeCreditsCount';
import { StyledOnboardingFreeCreditsLabel } from '@/onboarding/components/free-credits/StyledOnboardingFreeCreditsLabel';
import { StyledOnboardingFreeCreditsText } from '@/onboarding/components/free-credits/StyledOnboardingFreeCreditsText';
import { useOnboardingFreeCreditsTooltipContent } from '@/onboarding/hooks/useOnboardingFreeCreditsTooltipContent';
import { useOnboardingNewlyEarnedCredits } from '@/onboarding/hooks/useOnboardingNewlyEarnedCredits';
import { type OnboardingCreditsProgress } from '@/onboarding/types/OnboardingCreditsProgress';
import { styled } from '@linaria/react';
import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconCoins } from 'twenty-ui/icon';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledPill = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.transparent.light};
  border: 1px solid transparent;
  border-radius: ${themeCssVariables.border.radius.pill};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.tertiary};
  corner-shape: round;
  display: flex;
  gap: ${themeCssVariables.spacing['1.5']};
  height: ${themeCssVariables.spacing[6]};
  padding: 0 ${themeCssVariables.spacing[2]} 0
    ${themeCssVariables.spacing['1.5']};
  transition:
    background-color calc(${themeCssVariables.animation.duration.normal} * 1s),
    border-color calc(${themeCssVariables.animation.duration.normal} * 1s),
    color calc(${themeCssVariables.animation.duration.normal} * 1s);

  &[data-highlighted='earned'] {
    background-color: ${themeCssVariables.color.green3};
    border-color: ${themeCssVariables.color.green4};
    color: ${themeCssVariables.color.green9};
  }
`;

const StyledCreditsContent = styled(motion.span)`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing['1.5']};
`;

const StyledTooltipContents = styled.div`
  display: grid;
`;

const StyledTooltipContent = styled(motion.div)`
  grid-area: 1 / 1;
`;

type OnboardingFreeCreditsPillProps = {
  progress: OnboardingCreditsProgress;
};

export const OnboardingFreeCreditsPill = ({
  progress,
}: OnboardingFreeCreditsPillProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const { formatNumber } = useNumberFormat();
  const [hasTrackGrown, setHasTrackGrown] = useState(
    shouldReduceMotion ?? false,
  );
  const pillRef = useRef<HTMLDivElement>(null);

  const { earnedCredits, goalCredits, currentStep, currentStepCredits } =
    progress;
  const {
    seenCredits,
    newlyEarnedCredits,
    isFirstCreditsGain,
    markCreditsAsSeen,
  } = useOnboardingNewlyEarnedCredits();
  const tooltipContent = useOnboardingFreeCreditsTooltipContent({
    currentStep,
    newlyEarnedCredits,
    isFirstCreditsGain,
  });

  const hasNewlyEarnedCredits = newlyEarnedCredits > 0;
  const isEarningFirstCredits = goalCredits <= 0;

  const formatCredits = (credits: number) =>
    formatNumber(credits, { decimals: 2 });
  const formattedCurrentStepCredits = formatCredits(currentStepCredits);

  const tooltipSlideOffset = shouldReduceMotion
    ? 0
    : theme.spacingMultiplicator;

  return (
    <StyledContainer>
      <AnimatePresence>
        {hasNewlyEarnedCredits && (
          <OnboardingFreeCreditsChange
            key={newlyEarnedCredits}
            label={`+${formatCredits(newlyEarnedCredits)}`}
            delay={
              hasTrackGrown
                ? theme.animation.duration.normal
                : theme.animation.duration.normal * 2
            }
            onDisplayed={markCreditsAsSeen}
          />
        )}
      </AnimatePresence>
      <StyledPill
        ref={pillRef}
        data-highlighted={
          isEarningFirstCredits || hasNewlyEarnedCredits ? 'earned' : undefined
        }
      >
        <IconCoins size={theme.icon.size.md} color="currentColor" />
        <AnimatePresence mode="wait">
          <StyledCreditsContent
            key={isEarningFirstCredits ? 'earn' : 'progress'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: theme.animation.duration.fast }}
          >
            {isEarningFirstCredits ? (
              <StyledOnboardingFreeCreditsText>
                <StyledOnboardingFreeCreditsCount>{t`Earn ${formattedCurrentStepCredits}`}</StyledOnboardingFreeCreditsCount>
                <StyledOnboardingFreeCreditsLabel>
                  {plural(currentStepCredits, {
                    one: 'free credit',
                    other: 'free credits',
                  })}
                </StyledOnboardingFreeCreditsLabel>
              </StyledOnboardingFreeCreditsText>
            ) : (
              <OnboardingFreeCreditsProgress
                earnedCredits={earnedCredits}
                goalCredits={goalCredits}
                seenCredits={seenCredits}
                hasNewlyEarnedCredits={hasNewlyEarnedCredits}
                hasTrackGrown={hasTrackGrown}
                onTrackGrown={() => setHasTrackGrown(true)}
              />
            )}
          </StyledCreditsContent>
        </AnimatePresence>
      </StyledPill>
      <Tooltip.Root open={isDefined(tooltipContent)}>
        <Tooltip.Popup
          anchor={pillRef}
          side="bottom"
          align="end"
          arrow
          withExitAnimation
        >
          <StyledTooltipContents>
            <AnimatePresence initial={false}>
              {isDefined(tooltipContent) && (
                <StyledTooltipContent
                  key={tooltipContent.title}
                  initial={{ opacity: 0, y: tooltipSlideOffset }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -tooltipSlideOffset }}
                  transition={{ duration: theme.animation.duration.normal }}
                >
                  <Tooltip.Content description={tooltipContent.description}>
                    {tooltipContent.title}
                  </Tooltip.Content>
                </StyledTooltipContent>
              )}
            </AnimatePresence>
          </StyledTooltipContents>
        </Tooltip.Popup>
      </Tooltip.Root>
    </StyledContainer>
  );
};
