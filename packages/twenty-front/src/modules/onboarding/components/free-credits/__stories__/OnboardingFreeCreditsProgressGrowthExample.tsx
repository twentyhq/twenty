import { OnboardingFreeCreditsProgressBarGrowEffect } from '@/onboarding/components/free-credits/OnboardingFreeCreditsProgressBarGrowEffect';
import { styled } from '@linaria/react';
import { StrictMode, useRef, useState } from 'react';
import { ProgressBar } from 'twenty-ui/primitives/feedback';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { THEME_LIGHT, ThemeProvider, themeCssVariables } from 'twenty-ui/theme';

const GROW_DURATION_SECONDS = 1.5;
const GROWTH_THEME = {
  ...THEME_LIGHT,
  animation: {
    ...THEME_LIGHT.animation,
    duration: {
      ...THEME_LIGHT.animation.duration,
      normal: GROW_DURATION_SECONDS,
    },
  },
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  width: 240px;
`;

type ProgressGrowthProps = {
  hasTrackGrown: boolean;
  onTrackGrown: () => void;
};

const ProgressGrowth = ({
  hasTrackGrown,
  onTrackGrown,
}: ProgressGrowthProps) => {
  const progressBarRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <ProgressBar
        ref={progressBarRef}
        value={20}
        aria-label="Free credits earned"
      >
        <Text>Credits</Text>
      </ProgressBar>
      <OnboardingFreeCreditsProgressBarGrowEffect
        progressBarRef={progressBarRef}
        hasTrackGrown={hasTrackGrown}
        onTrackGrown={onTrackGrown}
      />
    </>
  );
};

export const OnboardingFreeCreditsProgressGrowthExample = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [hasTrackGrown, setHasTrackGrown] = useState(false);
  const [hasUpdatedCallback, setHasUpdatedCallback] = useState(false);
  const [initialCompletionCount, setInitialCompletionCount] = useState(0);
  const [latestCompletionCount, setLatestCompletionCount] = useState(0);

  return (
    <ThemeProvider colorScheme="light" theme={GROWTH_THEME}>
      <StyledContainer>
        {isMounted && (
          <StrictMode>
            <ProgressGrowth
              hasTrackGrown={hasTrackGrown}
              onTrackGrown={
                hasUpdatedCallback
                  ? () => setLatestCompletionCount((count) => count + 1)
                  : () => setInitialCompletionCount((count) => count + 1)
              }
            />
          </StrictMode>
        )}
        <Text>Initial completions: {initialCompletionCount}</Text>
        <Text>Latest completions: {latestCompletionCount}</Text>
        <Button
          disabled={isMounted}
          onClick={() => {
            setHasTrackGrown(false);
            setIsMounted(true);
          }}
        >
          Start growth
        </Button>
        <Button
          disabled={isMounted}
          onClick={() => {
            setHasTrackGrown(true);
            setIsMounted(true);
          }}
        >
          Mount completed track
        </Button>
        <Button onClick={() => setHasUpdatedCallback(true)}>
          Use latest callback
        </Button>
        <Button onClick={() => setHasTrackGrown(true)}>
          Finish growth externally
        </Button>
        <Button onClick={() => setIsMounted(false)}>Unmount progress</Button>
      </StyledContainer>
    </ThemeProvider>
  );
};
