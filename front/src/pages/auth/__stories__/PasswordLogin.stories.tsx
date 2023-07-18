import type { Meta, StoryObj } from '@storybook/react';

import { AuthModal } from '@/auth/components/ui/Modal';
import { AuthLayout } from '@/ui/layout/AuthLayout';
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
  render: getRenderWrapperForPage(
    <AuthLayout>
      <AuthModal>
        <PasswordLogin />
      </AuthModal>
    </AuthLayout>,
    '/auth/password-login',
  ),
  parameters: {
    msw: graphqlMocks,
  },
};
