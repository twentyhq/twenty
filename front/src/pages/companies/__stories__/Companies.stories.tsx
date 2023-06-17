import type { Meta, StoryObj } from '@storybook/react';

import { graphqlMocks } from '~/testing/graphqlMocks';
import { getRenderWrapperForPage } from '~/testing/renderWrappers';

import { Companies } from '../Companies';

const meta: Meta<typeof Companies> = {
  title: 'Pages/Companies',
  component: Companies,
};

export default meta;

export type Story = StoryObj<typeof Companies>;

export const Default: Story = {
  render: getRenderWrapperForPage(<Companies />, '/companies'),
  parameters: {
    msw: graphqlMocks,
  },
};
