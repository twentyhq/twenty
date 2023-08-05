import { MemoryRouter } from 'react-router-dom';
import type { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedActivities } from '~/testing/mock-data/activities';

import { TaskList } from '../TaskList';

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
