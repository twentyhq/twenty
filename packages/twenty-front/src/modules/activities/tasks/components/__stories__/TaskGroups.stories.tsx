import { type Meta, type StoryObj } from '@storybook/react';

import { TaskGroups } from '@/activities/tasks/components/TaskGroups';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedTasks } from '~/testing/mock-data/tasks';

const meta: Meta<typeof TaskGroups> = {
  title: 'Modules/Activity/TaskGroups',
  component: TaskGroups,
  decorators: [
    (Story) => (
      <TabListComponentInstanceContext.Provider
        value={{ instanceId: 'entity-tasks-filter-instance' }}
      >
        <ObjectFilterDropdownComponentInstanceContext.Provider
          value={{ instanceId: 'entity-tasks-filter-instance' }}
        >
          <Story />
        </ObjectFilterDropdownComponentInstanceContext.Provider>
      </TabListComponentInstanceContext.Provider>
    ),
    ComponentWithRouterDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
    I18nFrontDecorator,
  ],
};

export default meta;
type Story = StoryObj<typeof TaskGroups>;

export const Empty: Story = {};

export const WithTasks: Story = {
  args: {
    targetableObject: {
      id: mockedTasks[0].taskTargets?.[0].personId,
      targetObjectNameSingular: 'person',
    } as ActivityTargetableObject,
  },
  parameters: {
    msw: graphqlMocks,
    container: {
      width: '500px',
    },
  },
};
