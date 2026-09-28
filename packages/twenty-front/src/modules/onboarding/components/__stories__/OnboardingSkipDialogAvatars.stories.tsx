import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { OnboardingSkipDialogAvatars } from '@/onboarding/components/OnboardingSkipDialogAvatars';
import { ONBOARDING_NETWORK_PREVIEW_PEOPLE } from '@/onboarding/constants/OnboardingNetworkPreviewPeople';

const meta: Meta<typeof OnboardingSkipDialogAvatars> = {
  title: 'Modules/Onboarding/OnboardingSkipDialogAvatars',
  component: OnboardingSkipDialogAvatars,
  decorators: [ComponentDecorator],
  args: {
    avatars: ONBOARDING_NETWORK_PREVIEW_PEOPLE.map((person) => ({
      id: person.id,
      name: '',
      src: person.avatarUrl,
      shape: 'circle',
    })),
  },
};

export default meta;
type Story = StoryObj<typeof OnboardingSkipDialogAvatars>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(within(canvasElement).getAllByRole('presentation')).toHaveLength(
        ONBOARDING_NETWORK_PREVIEW_PEOPLE.length,
      ),
    );
  },
};

export const WithEmptySeats: Story = {
  args: {
    avatars: [{ id: 'Alice', name: 'Alice', shape: 'circle' }],
    emptySeatsCount: 2,
  },
};

export const CapsVisibleAvatars: Story = {
  args: {
    avatars: ['Alice', 'Bruno', 'Chloe', 'David', 'Emma', 'Farid'].map(
      (name) => ({ id: name, name, shape: 'circle' }),
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('E')).toBeInTheDocument();
    await expect(canvas.queryByText('F')).not.toBeInTheDocument();
  },
};
