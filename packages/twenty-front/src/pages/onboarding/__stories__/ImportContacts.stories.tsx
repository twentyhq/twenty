import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { within } from 'storybook/test';

import { ImportContacts } from '~/pages/onboarding/ImportContacts';

const StyledViewport = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
`;

const meta: Meta<typeof ImportContacts> = {
  title: 'Pages/Onboarding/ImportContacts',
  component: ImportContacts,
  parameters: { layout: 'fullscreen' },
  args: {
    creditsReward: 2,
    onContinueWithGoogle: action('continue-with-google'),
    onContinueWithMicrosoft: action('continue-with-microsoft'),
    onSkip: action('skip'),
  },
  decorators: [
    (Story) => (
      <StyledViewport>
        <Story />
      </StyledViewport>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ImportContacts>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Import your contacts');
  },
};
