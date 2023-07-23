import type { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/testing-library';

import { graphqlMocks } from '~/testing/graphqlMocks';
import { getRenderWrapperForPage } from '~/testing/renderWrappers';

import { Opportunities } from '../Opportunities';

const meta: Meta<typeof Opportunities> = {
  title: 'Pages/Opportunities/Default',
  component: Opportunities,
};

export default meta;

export type Story = StoryObj<typeof Opportunities>;

export const Default: Story = {
  render: getRenderWrapperForPage(<Opportunities />, '/opportunities'),
  parameters: {
    msw: graphqlMocks,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('All opportunities');
  },
};
