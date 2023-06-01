import type { Meta, StoryObj } from '@storybook/react';

import Companies from '../Companies';

import { getRenderWrapperForPage } from '../../../testing/renderWrappers';
import { graphqlMocks } from '../../../testing/graphqlMocks';

const meta: Meta<typeof Companies> = {
  title: 'Pages/Companies',
  component: Companies,
};

export default meta;

export type Story = StoryObj<typeof Companies>;

export const Default: Story = {
  render: getRenderWrapperForPage(<Companies />),
  parameters: {
    msw: graphqlMocks,
  },
};
