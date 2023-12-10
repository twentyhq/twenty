import { Meta, StoryObj } from '@storybook/react';

import { AppPath } from '@/types/AppPath';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { sleep } from '~/testing/sleep';

import { Tasks } from '../Tasks';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Tasks/Default',
  component: Tasks,
  decorators: [PageDecorator],
  args: { routePath: AppPath.TasksPage },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof Tasks>;

export const Default: Story = {
  play: async () => {
    await sleep(100);
  },
};
