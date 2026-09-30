import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { OnboardingFreeCreditsChange } from '@/onboarding/components/free-credits/OnboardingFreeCreditsChange';
import { OnboardingFreeCreditsPopoverContent } from '@/onboarding/components/free-credits/OnboardingFreeCreditsPopoverContent';
import { OnboardingFreeCreditsProgress } from '@/onboarding/components/free-credits/OnboardingFreeCreditsProgress';
import { StyledOnboardingFreeCreditsCount } from '@/onboarding/components/free-credits/StyledOnboardingFreeCreditsCount';
import { StyledOnboardingFreeCreditsLabel } from '@/onboarding/components/free-credits/StyledOnboardingFreeCreditsLabel';
import { StyledOnboardingFreeCreditsText } from '@/onboarding/components/free-credits/StyledOnboardingFreeCreditsText';
import { useOnboardingFreeCreditsTooltipContent } from '@/onboarding/hooks/useOnboardingFreeCreditsTooltipContent';
import { useMarkOnboardingFreeCreditsAsSeen } from '@/onboarding/hooks/useMarkOnboardingFreeCreditsAsSeen';
import { type OnboardingCreditsProgress } from '@/onboarding/types/OnboardingCreditsProgress';
import { formatOnboardingCredits } from '@/onboarding/utils/formatOnboardingCredits';
import { currentFocusedItemSelector } from '@/ui/utilities/focus/states/currentFocusedItemSelector';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconCoins, IconInfoCircle } from 'twenty-ui/icon';
import { Popover, Tooltip } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledPillAnchor = styled.div`
  display: flex;
`;

const StyledTrigger = styled.button`
  align-items: center;
  background: none;
  border: none;
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${themeCssVariables.font.color.tertiary};
  corner-shape: round;
  cursor: pointer;
  display: flex;
  font-family: inherit;
  padding: 0;

  &:hover > span,
  &[data-popup-open] > span {
    background-color: ${themeCssVariables.background.transparent.medium};
  }

  &:hover > span[data-highlighted='earned'],
  &[data-popup-open] > span[data-highlighted='earned'] {
    background-color: ${themeCssVariables.color.green4};
    border-color: ${themeCssVariables.color.green5};
  }
`;

const StyledTriggerPart = styled.span`
  align-items: center;
  background-color: ${themeCssVariables.background.transparent.light};
  border: 1px solid transparent;
  box-sizing: border-box;
  corner-shape: round;
  display: flex;
  height: ${themeCssVariables.spacing[6]};
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

const StyledCreditsPart = styled(StyledTriggerPart)`
  border-bottom-left-radius: ${themeCssVariables.border.radius.pill};
  border-right: none;
  border-top-left-radius: ${themeCssVariables.border.radius.pill};
  gap: ${themeCssVariables.spacing['1.5']};
  padding: 0 ${themeCssVariables.spacing[2]} 0
    ${themeCssVariables.spacing['1.5']};
`;

const StyledCreditsContent = styled(motion.span)`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing['1.5']};
`;

const StyledInfoPart = styled(StyledTriggerPart)`
  border-bottom-right-radius: ${themeCssVariables.border.radius.rounded};
  border-top-right-radius: ${themeCssVariables.border.radius.rounded};
  justify-content: center;
  padding: 0 ${themeCssVariables.spacing['1.5']} 0
    ${themeCssVariables.spacing[1]};

  &:not([data-highlighted='earned']) {
    border-left-color: ${themeCssVariables.border.color.transparentStrong};
  }
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
  const { numberFormat } = useNumberFormat();
  const [isPopoverShown, setIsPopoverShown] = useState(false);
  const currentFocusedItem = useAtomStateValue(currentFocusedItemSelector);
  const isModalFocused =
    currentFocusedItem?.componentInstance.componentType ===
    FocusComponentType.MODAL;
  const [hasTrackGrown, setHasTrackGrown] = useState(
    shouldReduceMotion ?? false,
  );
  const pillRef = useRef<HTMLDivElement>(null);

  const {
    earnedCredits,
    earnedCreditsByStep,
    goalCredits,
    currentStep,
    currentStepCredits,
    seenCredits,
    newlyEarnedCredits,
    isFirstCreditsGain,
  } = progress;
  const markCreditsAsSeen = useMarkOnboardingFreeCreditsAsSeen();
  const tooltipContent = useOnboardingFreeCreditsTooltipContent({
    currentStep,
    newlyEarnedCredits,
    isFirstCreditsGain,
  });

  const hasNewlyEarnedCredits = newlyEarnedCredits > 0;
  const isEarningFirstCredits = goalCredits <= 0;
  const highlight =
    isEarningFirstCredits || hasNewlyEarnedCredits ? 'earned' : undefined;

  const formattedCurrentStepCredits = formatOnboardingCredits(
    currentStepCredits,
    numberFormat,
  );

  const tooltipSlideOffset = shouldReduceMotion
    ? 0
    : theme.spacingMultiplicator;

  return (
    <StyledContainer>
      <AnimatePresence>
        {hasNewlyEarnedCredits && (
          <OnboardingFreeCreditsChange
            key={newlyEarnedCredits}
            label={`+${formatOnboardingCredits(newlyEarnedCredits, numberFormat)}`}
            delay={
              hasTrackGrown
                ? theme.animation.duration.normal
                : theme.animation.duration.normal * 2
            }
            onDisplayed={markCreditsAsSeen}
          />
        )}
      </AnimatePresence>
      <StyledPillAnchor ref={pillRef}>
        <Popover.Root
          onOpenChange={(open) => {
            if (open) {
              setIsPopoverShown(true);
            }
          }}
          onOpenChangeComplete={(open) => {
            if (!open) {
              setIsPopoverShown(false);
            }
          }}
        >
          <Popover.Trigger openOnHover render={<StyledTrigger />}>
            <StyledCreditsPart data-highlighted={highlight}>
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
            </StyledCreditsPart>
            <StyledInfoPart data-highlighted={highlight}>
              <IconInfoCircle size={theme.icon.size.md} color="currentColor" />
            </StyledInfoPart>
          </Popover.Trigger>
          <Popover.Popup side="bottom" align="end" aria-label={t`Free credits`}>
            <OnboardingFreeCreditsPopoverContent
              earnedCredits={earnedCredits}
              earnedCreditsByStep={earnedCreditsByStep}
            />
          </Popover.Popup>
        </Popover.Root>
      </StyledPillAnchor>
      <Tooltip.Root
        open={!isPopoverShown && !isModalFocused && isDefined(tooltipContent)}
      >
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
