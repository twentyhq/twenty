import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { within } from 'storybook/test';
import { IconGoogle, IconMicrosoft } from 'twenty-ui/icon';

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
    providerActions: [
      {
        label: 'Continue with Microsoft',
        Icon: IconMicrosoft,
        creditsReward: 2,
        onClick: action('continue-with-microsoft'),
      },
      {
        label: 'Continue with Google',
        Icon: IconGoogle,
        creditsReward: 2,
        onClick: action('continue-with-google'),
      },
    ],
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
