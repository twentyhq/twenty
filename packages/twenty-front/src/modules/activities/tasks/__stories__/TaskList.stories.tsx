import { Meta, StoryObj } from '@storybook/react';

import { TaskList } from '@/activities/tasks/components/TaskList';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedActivities } from '~/testing/mock-data/activities';

const meta: Meta<typeof TaskList> = {
  title: 'Modules/Activity/TaskList',
  component: TaskList,
  decorators: [MemoryRouterDecorator, ComponentDecorator, SnackBarDecorator],
  args: {
    title: 'Tasks',
    tasks: mockedActivities,
  },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;
type Story = StoryObj<typeof TaskList>;

export const Default: Story = {
  args: {
    title: 'Tasks',
    tasks: mockedActivities,
  },
};
