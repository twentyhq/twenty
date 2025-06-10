import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';

import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { NotFound } from '../NotFound';
const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/NotFound/Default',
  component: NotFound,
  decorators: [PageDecorator],
  args: {
    routePath: '/toto-not-found',
  },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof NotFound>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Off the beaten path');
  },
};
