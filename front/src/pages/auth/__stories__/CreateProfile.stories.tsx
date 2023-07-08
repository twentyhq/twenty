import type { Meta, StoryObj } from '@storybook/react';

import { AuthModal } from '@/auth/components/ui/Modal';
import { AuthLayout } from '@/ui/layout/AuthLayout';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { getRenderWrapperForPage } from '~/testing/renderWrappers';

import { CreateProfile } from '../CreateProfile';

const meta: Meta<typeof CreateProfile> = {
  title: 'Pages/Auth/CreateProfile',
  component: CreateProfile,
};

export default meta;

export type Story = StoryObj<typeof CreateProfile>;

export const Default: Story = {
  render: getRenderWrapperForPage(
    <AuthLayout>
      <AuthModal>
        <CreateProfile />
      </AuthModal>
    </AuthLayout>,
    '/auth/create-profile',
  ),
  parameters: {
    msw: graphqlMocks,
  },
};
