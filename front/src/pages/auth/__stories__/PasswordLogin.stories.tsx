import type { Meta, StoryObj } from '@storybook/react';

import { graphqlMocks } from '~/testing/graphqlMocks';
import { getRenderWrapperForPage } from '~/testing/renderWrappers';

import { PasswordLogin } from '../PasswordLogin';

const meta: Meta<typeof PasswordLogin> = {
  title: 'Pages/Auth/PasswordLogin',
  component: PasswordLogin,
};

export default meta;

export type Story = StoryObj<typeof PasswordLogin>;

export const Default: Story = {
  render: getRenderWrapperForPage(<PasswordLogin />, '/auth/password-login'),
  parameters: {
    msw: graphqlMocks,
  },
};
