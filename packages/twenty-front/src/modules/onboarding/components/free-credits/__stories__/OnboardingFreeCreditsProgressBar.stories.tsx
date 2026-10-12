import { OnboardingFreeCreditsProgressGrowthExample } from '@/onboarding/components/free-credits/__stories__/OnboardingFreeCreditsProgressGrowthExample';
import { OnboardingFreeCreditsProgressBar } from '@/onboarding/components/free-credits/OnboardingFreeCreditsProgressBar';
import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { useState } from 'react';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const TRACK_GROWTH_EVENT_NAME = 'animationend';
const REDUCED_MOTION_CHANGE_EVENT_NAME = 'change';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const GROWTH_TIMEOUT_MS = 1500;
const HALF_GROWTH_TIMEOUT_MS = GROWTH_TIMEOUT_MS / 2;
const GROWTH_COMPLETION_WAIT_MS = HALF_GROWTH_TIMEOUT_MS + 250;
const GROWTH_SETTLE_DELAY_MS = GROWTH_TIMEOUT_MS + 100;

const waitForGrowthTimeout = () =>
  new Promise((resolve) => setTimeout(resolve, GROWTH_SETTLE_DELAY_MS));

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
  render: () => <OnboardingFreeCreditsProgressGrowthExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const reducedMotion = mockReducedMotionPreference(false);

    try {
      await userEvent.click(
        canvas.getByRole('button', { name: 'Start growth' }),
      );
      const progressBar = canvas.getByRole('progressbar');
      canvas
        .getByText('Credits')
        .dispatchEvent(
          new AnimationEvent(TRACK_GROWTH_EVENT_NAME, { bubbles: true }),
        );
      await expect(canvas.getByText('Initial completions: 0')).toBeVisible();
      await userEvent.click(
        canvas.getByRole('button', { name: 'Use latest callback' }),
      );
      progressBar.dispatchEvent(new AnimationEvent(TRACK_GROWTH_EVENT_NAME));
      progressBar.dispatchEvent(new AnimationEvent(TRACK_GROWTH_EVENT_NAME));
      await waitFor(() =>
        expect(canvas.getByText('Latest completions: 1')).toBeVisible(),
      );
      reducedMotion.enableReducedMotion();
      await waitForGrowthTimeout();
      await expect(canvas.getByText('Initial completions: 0')).toBeVisible();
      await expect(canvas.getByText('Latest completions: 1')).toBeVisible();
    } finally {
      reducedMotion.restore();
    }
  },
};

export const GrowthFallback: Story = {
  render: () => <OnboardingFreeCreditsProgressGrowthExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const reducedMotion = mockReducedMotionPreference(false);

    try {
      await userEvent.click(
        canvas.getByRole('button', { name: 'Start growth' }),
      );
      await new Promise((resolve) =>
        setTimeout(resolve, HALF_GROWTH_TIMEOUT_MS),
      );
      await userEvent.click(
        canvas.getByRole('button', { name: 'Use latest callback' }),
      );
      await waitFor(
        () => expect(canvas.getByText('Latest completions: 1')).toBeVisible(),
        { timeout: GROWTH_COMPLETION_WAIT_MS },
      );
      await expect(canvas.getByText('Initial completions: 0')).toBeVisible();
      canvas
        .getByRole('progressbar')
        .dispatchEvent(new AnimationEvent(TRACK_GROWTH_EVENT_NAME));
      await waitForGrowthTimeout();
      await expect(canvas.getByText('Latest completions: 1')).toBeVisible();
    } finally {
      reducedMotion.restore();
    }
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
      await waitFor(() =>
        expect(canvas.getByText('Initial completions: 1')).toBeVisible(),
      );
      canvas
        .getByRole('progressbar')
        .dispatchEvent(new AnimationEvent(TRACK_GROWTH_EVENT_NAME));
      await waitForGrowthTimeout();
      await expect(canvas.getByText('Initial completions: 1')).toBeVisible();
    } finally {
      reducedMotion.restore();
    }
  },
};

export const ReducedMotionChange: Story = {
  render: () => <OnboardingFreeCreditsProgressGrowthExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const reducedMotion = mockReducedMotionPreference(false);

    try {
      await userEvent.click(
        canvas.getByRole('button', { name: 'Start growth' }),
      );
      await expect(canvas.getByText('Initial completions: 0')).toBeVisible();
      reducedMotion.enableReducedMotion();
      await waitFor(() =>
        expect(canvas.getByText('Initial completions: 1')).toBeVisible(),
      );
      await waitForGrowthTimeout();
      await expect(canvas.getByText('Initial completions: 1')).toBeVisible();
    } finally {
      reducedMotion.restore();
    }
  },
};

export const GrowthCleanup: Story = {
  render: () => <OnboardingFreeCreditsProgressGrowthExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const reducedMotion = mockReducedMotionPreference(false);

    try {
      await userEvent.click(
        canvas.getByRole('button', { name: 'Start growth' }),
      );
      await userEvent.click(
        canvas.getByRole('button', { name: 'Finish growth externally' }),
      );
      canvas
        .getByRole('progressbar')
        .dispatchEvent(new AnimationEvent(TRACK_GROWTH_EVENT_NAME));
      reducedMotion.enableReducedMotion();
      await waitForGrowthTimeout();
      await expect(canvas.getByText('Initial completions: 0')).toBeVisible();
      await userEvent.click(
        canvas.getByRole('button', { name: 'Unmount progress' }),
      );
      await userEvent.click(
        canvas.getByRole('button', { name: 'Mount completed track' }),
      );
      canvas
        .getByRole('progressbar')
        .dispatchEvent(new AnimationEvent(TRACK_GROWTH_EVENT_NAME));
      reducedMotion.enableReducedMotion();
      await waitForGrowthTimeout();
      await expect(canvas.getByText('Initial completions: 0')).toBeVisible();
      await userEvent.click(
        canvas.getByRole('button', { name: 'Unmount progress' }),
      );
    } finally {
      reducedMotion.restore();
    }

    const nextReducedMotion = mockReducedMotionPreference(false);

    try {
      await userEvent.click(
        canvas.getByRole('button', { name: 'Start growth' }),
      );
      const progressBar = canvas.getByRole('progressbar');
      await userEvent.click(
        canvas.getByRole('button', { name: 'Unmount progress' }),
      );
      await expect(canvas.queryByRole('progressbar')).not.toBeInTheDocument();
      progressBar.dispatchEvent(new AnimationEvent(TRACK_GROWTH_EVENT_NAME));
      nextReducedMotion.enableReducedMotion();
      await waitForGrowthTimeout();
      await expect(canvas.getByText('Initial completions: 0')).toBeVisible();
    } finally {
      nextReducedMotion.restore();
    }
  },
};
