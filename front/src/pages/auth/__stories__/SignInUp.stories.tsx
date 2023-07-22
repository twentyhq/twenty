import type { Meta, StoryObj } from '@storybook/react';

import { AuthModal } from '@/auth/components/Modal';
import { AuthLayout } from '@/ui/layout/components/AuthLayout';
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
  render: getRenderWrapperForPage(
    <AuthLayout>
      <AuthModal>
        <SignInUp />
      </AuthModal>
    </AuthLayout>,
    '/',
  ),
  parameters: {
    msw: graphqlMocks,
  },
};
