import { MemoryRouter } from 'react-router-dom';
import { Meta, StoryObj } from '@storybook/react';

import { TaskList } from '@/activities/tasks/components/TaskList';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedActivities } from '~/testing/mock-data/activities';

const meta: Meta<typeof TaskList> = {
  title: 'Modules/Activity/TaskList',
  component: TaskList,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
    ComponentDecorator,
  ],
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
