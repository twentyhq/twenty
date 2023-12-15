import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';

import { AppPath } from '@/types/AppPath';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { PlanRequired } from '../PlanRequired';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Auth/PlanRequired',
  component: PlanRequired,
  decorators: [PageDecorator],
  args: { routePath: AppPath.PlanRequired },
  parameters: {
    msw: graphqlMocks,
    cookie: {
      tokenPair: '{}',
    },
  },
};

export default meta;

export type Story = StoryObj<typeof PlanRequired>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByRole('button', { name: 'Get started' });
  },
};
