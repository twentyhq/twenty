import type { Meta, StoryObj } from '@storybook/react';

import { graphqlMocks } from '~/testing/graphqlMocks';
import { getRenderWrapperForPage } from '~/testing/renderWrappers';

import { Index } from '../Index';

const meta: Meta<typeof Index> = {
  title: 'Pages/Auth/Index',
  component: Index,
};

export default meta;

export type Story = StoryObj<typeof Index>;

export const Default: Story = {
  render: getRenderWrapperForPage(<Index />, '/auth'),
  parameters: {
    msw: graphqlMocks,
  },
};
