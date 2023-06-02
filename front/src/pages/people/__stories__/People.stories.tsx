import type { Meta, StoryObj } from '@storybook/react';

import People from '../People';

import { render } from './shared';
import { graphqlMocks } from '../../../testing/graphqlMocks';

const meta: Meta<typeof People> = {
  title: 'Pages/People',
  component: People,
};

export default meta;

export type Story = StoryObj<typeof People>;

export const Default: Story = {
  render,
  parameters: {
    msw: graphqlMocks,
  },
};
