import type { Meta, StoryObj } from '@storybook/react';

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
    cookie: {
      tokenPair: '{}',
    },
  },
};
