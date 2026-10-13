import { OnboardingFreeCreditsProgressBar } from '@/onboarding/components/free-credits/OnboardingFreeCreditsProgressBar';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  width: 240px;
`;

export const OnboardingFreeCreditsProgressGrowthExample = () => {
  const [hasStartedGrowth, setHasStartedGrowth] = useState(false);
  const [hasTrackGrown, setHasTrackGrown] = useState(false);

  return (
    <StyledContainer>
      {hasStartedGrowth && (
        <OnboardingFreeCreditsProgressBar
          value={hasTrackGrown ? 60 : 20}
          max={100}
          aria-label="Free credits earned"
          hasTrackGrown={hasTrackGrown}
          hasNewlyEarnedCredits
          onTrackGrown={() => setHasTrackGrown(true)}
        />
      )}
      <Button
        disabled={hasStartedGrowth}
        onClick={() => setHasStartedGrowth(true)}
      >
        Start growth
      </Button>
    </StyledContainer>
  );
};
