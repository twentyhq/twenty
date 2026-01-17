import { type Meta, type StoryObj } from '@storybook/react-vite';

import { TaskList } from '@/activities/tasks/components/TaskList';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { RightDrawerDecorator } from '~/testing/decorators/RightDrawerDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedTasks } from '~/testing/mock-data/tasks';

const meta: Meta<typeof TaskList> = {
  title: 'Modules/Activity/TaskList',
  component: TaskList,
  decorators: [
    ComponentDecorator,
    ContextStoreDecorator,
    MemoryRouterDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
    RightDrawerDecorator,
  ],
  args: {
    title: 'Tasks',
    tasks: mockedTasks,
  },
  parameters: {
    msw: graphqlMocks,
    container: {
      width: '500px',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TaskList>;

export const Default: Story = {
  args: {
    title: 'Tasks',
    tasks: mockedTasks,
  },
};
