import { OnboardingFreeCreditsAnimatedCount } from '@/onboarding/components/free-credits/OnboardingFreeCreditsAnimatedCount';
import { OnboardingFreeCreditsProgressBar } from '@/onboarding/components/free-credits/OnboardingFreeCreditsProgressBar';
import { StyledOnboardingFreeCreditsCount } from '@/onboarding/components/free-credits/StyledOnboardingFreeCreditsCount';
import { StyledOnboardingFreeCreditsLabel } from '@/onboarding/components/free-credits/StyledOnboardingFreeCreditsLabel';
import { StyledOnboardingFreeCreditsText } from '@/onboarding/components/free-credits/StyledOnboardingFreeCreditsText';
import { styled } from '@linaria/react';
import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { VisuallyHidden } from 'twenty-ui/primitives/accessibility';
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
        <OnboardingFreeCreditsProgressBar
          value={displayedCredits}
          max={goalCredits}
          aria-label={t`Free credits earned`}
          hasTrackGrown={hasTrackGrown}
          hasNewlyEarnedCredits={hasNewlyEarnedCredits}
          onTrackGrown={onTrackGrown}
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
