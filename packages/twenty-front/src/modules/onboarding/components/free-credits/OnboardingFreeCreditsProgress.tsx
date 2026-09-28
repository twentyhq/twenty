import { OnboardingFreeCreditsAnimatedCount } from '@/onboarding/components/free-credits/OnboardingFreeCreditsAnimatedCount';
import { StyledOnboardingFreeCreditsCount } from '@/onboarding/components/free-credits/StyledOnboardingFreeCreditsCount';
import { StyledOnboardingFreeCreditsLabel } from '@/onboarding/components/free-credits/StyledOnboardingFreeCreditsLabel';
import { StyledOnboardingFreeCreditsText } from '@/onboarding/components/free-credits/StyledOnboardingFreeCreditsText';
import { styled } from '@linaria/react';
import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { ProgressBar } from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledProgressBar = styled(ProgressBar)`
  flex-shrink: 0;
  height: ${themeCssVariables.spacing['1.5']};
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

  const displayedCredits = hasTrackGrown ? earnedCredits : seenCredits;

  return (
    <>
      <StyledProgressBar
        value={Math.min(100, (displayedCredits / goalCredits) * 100)}
        ariaLabel={t`Free credits earned`}
        backgroundColor={themeCssVariables.background.transparent.medium}
        barColor={themeCssVariables.color.green9}
        withBorderRadius
        withGrowIn={!hasTrackGrown}
        withGlint={hasTrackGrown && hasNewlyEarnedCredits}
        withSpringFill
        onGrowInComplete={onTrackGrown}
      />
      <StyledOnboardingFreeCreditsText>
        <StyledOnboardingFreeCreditsCount>
          <OnboardingFreeCreditsAnimatedCount credits={displayedCredits} />
          /
          <OnboardingFreeCreditsAnimatedCount credits={goalCredits} />
        </StyledOnboardingFreeCreditsCount>
        <StyledOnboardingFreeCreditsLabel>
          {plural(goalCredits, {
            one: 'free credit',
            other: 'free credits',
          })}
        </StyledOnboardingFreeCreditsLabel>
      </StyledOnboardingFreeCreditsText>
    </>
  );
};
