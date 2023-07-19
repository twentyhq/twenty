import type { Meta, StoryObj } from '@storybook/react';

import { AuthModal } from '@/auth/components/ui/Modal';
import { AuthLayout } from '@/ui/layout/components/AuthLayout';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { getRenderWrapperForPage } from '~/testing/renderWrappers';

import { CreateWorkspace } from '../CreateWorkspace';

const meta: Meta<typeof CreateWorkspace> = {
  title: 'Pages/Auth/CreateWorkspace',
  component: CreateWorkspace,
};

export default meta;

export type Story = StoryObj<typeof CreateWorkspace>;

export const Default: Story = {
  render: getRenderWrapperForPage(
    <AuthLayout>
      <AuthModal>
        <CreateWorkspace />
      </AuthModal>
    </AuthLayout>,
    '/create-workspace',
  ),
  parameters: {
    msw: graphqlMocks,
  },
};
