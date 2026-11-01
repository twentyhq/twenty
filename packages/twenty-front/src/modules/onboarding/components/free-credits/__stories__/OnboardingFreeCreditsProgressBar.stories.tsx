import { OnboardingFreeCreditsProgressGrowthExample } from '@/onboarding/components/free-credits/__stories__/OnboardingFreeCreditsProgressGrowthExample';
import { OnboardingFreeCreditsProgressBar } from '@/onboarding/components/free-credits/OnboardingFreeCreditsProgressBar';
import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { useState } from 'react';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { isDefined } from 'twenty-shared/utils';

const TRACK_GROWTH_EVENT_NAME = 'animationend';
const REDUCED_MOTION_CHANGE_EVENT_NAME = 'change';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const mockReducedMotionPreference = (matches: boolean) => {
  const originalMatchMedia = window.matchMedia;
  const reducedMotionMedia = Object.assign(new EventTarget(), {
    matches,
    media: REDUCED_MOTION_QUERY,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
  });

  window.matchMedia = (query) =>
    query === REDUCED_MOTION_QUERY
      ? reducedMotionMedia
      : originalMatchMedia(query);

  return {
    enableReducedMotion: () => {
      reducedMotionMedia.matches = true;
      reducedMotionMedia.dispatchEvent(
        new MediaQueryListEvent(REDUCED_MOTION_CHANGE_EVENT_NAME, {
          matches: true,
          media: REDUCED_MOTION_QUERY,
        }),
      );
    },
    restore: () => {
      window.matchMedia = originalMatchMedia;
    },
  };
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  width: 240px;
`;

const StyledPausedGrowth = styled.div`
  [data-grow-in] {
    animation-duration: calc(
      ${themeCssVariables.animation.duration.normal} * 1s
    ) !important;
    animation-play-state: paused;
  }
`;

const OnboardingProgressExample = () => {
  const [hasTrackGrown, setHasTrackGrown] = useState(false);
  const [earnedCredits, setEarnedCredits] = useState(60);
  const [goalCredits, setGoalCredits] = useState(100);

  return (
    <StyledContainer>
      <OnboardingFreeCreditsProgressBar
        value={hasTrackGrown ? earnedCredits : 20}
        max={goalCredits}
        aria-label="Free credits earned"
        hasTrackGrown={hasTrackGrown}
        hasNewlyEarnedCredits
        onTrackGrown={() => setHasTrackGrown(true)}
      />
      <Button onClick={() => setEarnedCredits((credits) => credits + 20)}>
        Earn 20 credits
      </Button>
      <Button onClick={() => setGoalCredits(200)}>
        Set goal to 200 credits
      </Button>
    </StyledContainer>
  );
};

const meta: Meta<typeof OnboardingFreeCreditsProgressBar> = {
  title: 'Modules/Onboarding/FreeCredits/ProgressBar',
  component: OnboardingFreeCreditsProgressBar,
};

export default meta;

type Story = StoryObj<typeof OnboardingFreeCreditsProgressBar>;

export const Choreography: Story = {
  render: () => <OnboardingProgressExample />,
};

export const Updates: Story = {
  render: () => <OnboardingProgressExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const progressBar = canvas.getByRole('progressbar', {
      name: 'Free credits earned',
    });

    await waitFor(() =>
      expect(progressBar).toHaveAttribute('aria-valuenow', '60'),
    );
    await expect(progressBar).not.toHaveAttribute('data-grow-in');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Earn 20 credits' }),
    );
    await expect(progressBar).toHaveAttribute('aria-valuenow', '80');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Set goal to 200 credits' }),
    );
    await expect(progressBar).toHaveAttribute('aria-valuemax', '200');
    await expect(progressBar).toHaveAttribute('aria-valuetext', '40%');
  },
};

export const GrowthCompletion: Story = {
  render: () => (
    <StyledPausedGrowth>
      <OnboardingFreeCreditsProgressGrowthExample />
    </StyledPausedGrowth>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Start growth' }));
    const progressBar = canvas.getByRole('progressbar', {
      name: 'Free credits earned',
    });
    const track = progressBar.firstElementChild;
    const [growthAnimation] = progressBar.getAnimations();

    await expect(track).not.toBeNull();
    await expect(growthAnimation).toBeDefined();

    if (!isDefined(track) || !isDefined(growthAnimation)) {
      throw new Error('The progress track and growth animation must exist');
    }

    track.dispatchEvent(
      new AnimationEvent(TRACK_GROWTH_EVENT_NAME, { bubbles: true }),
    );
    await expect(progressBar).toHaveAttribute('aria-valuenow', '20');
    await expect(progressBar).toHaveAttribute('data-grow-in');
    growthAnimation.play();
    await waitFor(() =>
      expect(progressBar).toHaveAttribute('aria-valuenow', '60'),
    );
    await expect(progressBar).not.toHaveAttribute('data-grow-in');
  },
};

export const ReducedMotionCompletion: Story = {
  render: () => <OnboardingFreeCreditsProgressGrowthExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const reducedMotion = mockReducedMotionPreference(true);

    try {
      await userEvent.click(
        canvas.getByRole('button', { name: 'Start growth' }),
      );
      const progressBar = canvas.getByRole('progressbar', {
        name: 'Free credits earned',
      });

      await waitFor(() =>
        expect(progressBar).toHaveAttribute('aria-valuenow', '60'),
      );
      await expect(progressBar).not.toHaveAttribute('data-grow-in');
    } finally {
      reducedMotion.restore();
    }
  },
};

export const ReducedMotionChange: Story = {
  render: () => (
    <StyledPausedGrowth>
      <OnboardingFreeCreditsProgressGrowthExample />
    </StyledPausedGrowth>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const reducedMotion = mockReducedMotionPreference(false);

    try {
      await userEvent.click(
        canvas.getByRole('button', { name: 'Start growth' }),
      );
      const progressBar = canvas.getByRole('progressbar', {
        name: 'Free credits earned',
      });

      await expect(progressBar).toHaveAttribute('aria-valuenow', '20');
      await expect(progressBar).toHaveAttribute('data-grow-in');
      reducedMotion.enableReducedMotion();
      await waitFor(() =>
        expect(progressBar).toHaveAttribute('aria-valuenow', '60'),
      );
      await expect(progressBar).not.toHaveAttribute('data-grow-in');
    } finally {
      reducedMotion.restore();
    }
  },
};
