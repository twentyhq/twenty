import type { Meta, StoryObj } from '@storybook/react';
import { fireEvent, within } from '@storybook/testing-library';

import { graphqlMocks } from '~/testing/graphqlMocks';
import { getRenderWrapperForPage } from '~/testing/renderWrappers';

import { SignInUp } from '../SignInUp';

const meta: Meta<typeof SignInUp> = {
  title: 'Pages/Auth/SignInUp',
  component: SignInUp,
};

export default meta;

export type Story = StoryObj<typeof SignInUp>;

export const Default: Story = {
  render: getRenderWrapperForPage(<SignInUp />, '/sign-in'),
  parameters: {
    msw: graphqlMocks,
    cookie: {
      tokenPair: '{}',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const continueWithEmailButton = await canvas.findByText(
      'Continue With Email',
    );

    await fireEvent.click(continueWithEmailButton);
  },
};
