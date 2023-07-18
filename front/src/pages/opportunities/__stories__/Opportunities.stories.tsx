import type { Meta, StoryObj } from '@storybook/react';

import { graphqlMocks } from '~/testing/graphqlMocks';
import { getRenderWrapperForPage } from '~/testing/renderWrappers';

import { Opportunities } from '../Opportunities';

const meta: Meta<typeof Opportunities> = {
  title: 'Pages/Opportunities',
  component: Opportunities,
};

export default meta;

export type Story = StoryObj<typeof Opportunities>;

export const Default: Story = {
  render: getRenderWrapperForPage(<Opportunities />, '/opportunities'),
  parameters: {
    msw: graphqlMocks,
  },
};
