import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { OnboardingCreditsRewardChip } from '@/onboarding/components/OnboardingCreditsRewardChip';

const meta: Meta<typeof OnboardingCreditsRewardChip> = {
  title: 'Modules/Onboarding/OnboardingCreditsRewardChip',
  component: OnboardingCreditsRewardChip,
  decorators: [ComponentDecorator],
  args: { formattedCreditsReward: '2' },
};

export default meta;
type Story = StoryObj<typeof OnboardingCreditsRewardChip>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByText('+2')).toBeVisible();
  },
};

export const PerItem: Story = {
  args: { formattedCreditsReward: '0.5', isRewardPerItem: true },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText('+0.5 each'),
    ).toBeVisible();
  },
};
