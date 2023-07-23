import type { Meta, StoryObj } from '@storybook/react';

import { getRenderWrapperForSignInUp } from '~/testing/renderWrappers';

import { SignInUp } from '../SignInUp';

const meta: Meta<typeof SignInUp> = {
  title: 'Pages/Auth/SignInUp',
  component: SignInUp,
};

export default meta;

export type Story = StoryObj<typeof SignInUp>;

export const Default: Story = {
  render: getRenderWrapperForSignInUp(<SignInUp />, '/sign-in'),
  parameters: {
    cookie: {
      tokenPair: '{}',
    },
  },
};
