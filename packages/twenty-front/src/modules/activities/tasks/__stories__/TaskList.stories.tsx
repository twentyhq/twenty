import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui';

import { TaskList } from '@/activities/tasks/components/TaskList';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedTasks } from '~/testing/mock-data/tasks';

const workspaceMember: WorkspaceMember = {
  __typename: 'WorkspaceMember',
  id: '374fe3a5-df1e-4119-afe0-2a62a2ba481e',
  name: {
    firstName: 'Charles',
    lastName: 'Test',
  },
  avatarUrl: '',
  locale: 'en',
  createdAt: '2023-04-26T10:23:42.33625+00:00',
  updatedAt: '2023-04-26T10:23:42.33625+00:00',
  userId: 'e2409670-1088-46b4-858e-f20a598d9d0f',
  userEmail: 'charles@test.com',
  colorScheme: 'Light',
};

const meta: Meta<typeof TaskList> = {
  title: 'Modules/Activity/TaskList',
  component: TaskList,
  decorators: [MemoryRouterDecorator, ComponentDecorator, SnackBarDecorator],
  args: {
    title: 'Tasks',
    tasks: mockedTasks,
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
    tasks: mockedTasks,
  },
};
