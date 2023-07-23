import type { Meta, StoryObj } from '@storybook/react';

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
  render: getRenderWrapperForPage(<CreateWorkspace />, '/create-workspace'),
  parameters: {
    msw: graphqlMocks,
  },
};
