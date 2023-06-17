import type { Meta, StoryObj } from '@storybook/react';

import { graphqlMocks } from '~/testing/graphqlMocks';
import { getRenderWrapperForPage } from '~/testing/renderWrappers';

import { People } from '../People';

const meta: Meta<typeof People> = {
  title: 'Pages/People',
  component: People,
};

export default meta;

export type Story = StoryObj<typeof People>;

export const Default: Story = {
  render: getRenderWrapperForPage(<People />),
  parameters: {
    msw: graphqlMocks,
  },
};
