import { Meta, StoryObj } from '@storybook/react';

import { TasksRecoilScopeContext } from '@/activities/states/recoil-scope-contexts/TasksRecoilScopeContext';
import { TaskGroups } from '@/activities/tasks/components/TaskGroups';
import { ObjectFilterDropdownScope } from '@/ui/object/object-filter-dropdown/scopes/ObjectFilterDropdownScope';
import { ComponentWithRecoilScopeDecorator } from '~/testing/decorators/ComponentWithRecoilScopeDecorator';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedTasks } from '~/testing/mock-data/activities';

import { ActivityTargetableEntityType } from '../../types/ActivityTargetableEntity';

const meta: Meta<typeof TaskGroups> = {
  title: 'Modules/Activity/TaskGroups',
  component: TaskGroups,
  decorators: [
    (Story) => (
      <ObjectFilterDropdownScope filterScopeId="entity-tasks-filter-scope">
        <Story />
      </ObjectFilterDropdownScope>
    ),
    ComponentWithRouterDecorator,
    ComponentWithRecoilScopeDecorator,
  ],
  parameters: {
    msw: graphqlMocks,
    customRecoilScopeContext: TasksRecoilScopeContext,
  },
};

export default meta;
type Story = StoryObj<typeof TaskGroups>;

export const Empty: Story = {};

export const WithTasks: Story = {
  args: {
    entity: {
      id: mockedTasks[0].authorId,
      type: ActivityTargetableEntityType.Person,
    },
  },
};
