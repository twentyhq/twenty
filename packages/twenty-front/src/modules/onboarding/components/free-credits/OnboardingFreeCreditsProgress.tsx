import { OnboardingFreeCreditsAnimatedCount } from '@/onboarding/components/free-credits/OnboardingFreeCreditsAnimatedCount';
import { StyledOnboardingFreeCreditsCount } from '@/onboarding/components/free-credits/StyledOnboardingFreeCreditsCount';
import { StyledOnboardingFreeCreditsLabel } from '@/onboarding/components/free-credits/StyledOnboardingFreeCreditsLabel';
import { StyledOnboardingFreeCreditsText } from '@/onboarding/components/free-credits/StyledOnboardingFreeCreditsText';
import { styled } from '@linaria/react';
import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { VisuallyHidden } from 'twenty-ui/primitives/accessibility';
import { ProgressBar } from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledProgressBarContainer = styled.div`
  flex-shrink: 0;
  width: ${themeCssVariables.spacing[16]};
`;

type OnboardingFreeCreditsProgressProps = {
  earnedCredits: number;
  goalCredits: number;
  seenCredits: number;
  hasNewlyEarnedCredits: boolean;
  hasTrackGrown: boolean;
  onTrackGrown: () => void;
};

export const OnboardingFreeCreditsProgress = ({
  earnedCredits,
  goalCredits,
  seenCredits,
  hasNewlyEarnedCredits,
  hasTrackGrown,
  onTrackGrown,
}: OnboardingFreeCreditsProgressProps) => {
  const { t } = useLingui();
  const isMobile = useIsMobile();

  const displayedCredits = hasTrackGrown ? earnedCredits : seenCredits;
  const goalCreditsLabel = plural(goalCredits, {
    one: 'free credit',
    other: 'free credits',
  });

  return (
    <>
      <StyledProgressBarContainer>
        <ProgressBar
          value={Math.min(100, (displayedCredits / goalCredits) * 100)}
          size="sm"
          ariaLabel={t`Free credits earned`}
          backgroundColor={themeCssVariables.background.transparent.medium}
          barColor={themeCssVariables.color.green9}
          withBorderRadius
          withGrowIn={!hasTrackGrown}
          withGlint={hasTrackGrown && hasNewlyEarnedCredits}
          withSpringFill
          withMinimumFillWidth={false}
          onGrowInComplete={onTrackGrown}
        />
      </StyledProgressBarContainer>
      <StyledOnboardingFreeCreditsText>
        <StyledOnboardingFreeCreditsCount>
          <OnboardingFreeCreditsAnimatedCount credits={displayedCredits} />
          /
          <OnboardingFreeCreditsAnimatedCount credits={goalCredits} />
        </StyledOnboardingFreeCreditsCount>
        {isMobile ? (
          <VisuallyHidden>{goalCreditsLabel}</VisuallyHidden>
        ) : (
          <StyledOnboardingFreeCreditsLabel>
            {goalCreditsLabel}
          </StyledOnboardingFreeCreditsLabel>
        )}
      </StyledOnboardingFreeCreditsText>
    </>
  );
};
