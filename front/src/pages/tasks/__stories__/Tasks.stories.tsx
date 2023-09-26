import { Meta, StoryObj } from '@storybook/react';

import { AppPath } from '@/types/AppPath';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { Tasks } from '../Tasks';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Tasks/Default',
  component: Tasks,
  decorators: [PageDecorator],
  args: { routePath: AppPath.TasksPage },
  parameters: {
    docs: { story: 'inline', iframeHeight: '500px' },
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof Tasks>;

export const Default: Story = {};
