import { type Meta, type StoryObj } from '@storybook/react-vite';

import { TaskGroups } from '@/activities/tasks/components/TaskGroups';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { RightDrawerDecorator } from '~/testing/decorators/RightDrawerDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedPersonRecords } from '~/testing/mock-data/generated/data/people/mock-people-data';

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
    RightDrawerDecorator,
    SnackBarDecorator,
  ],
};

export default meta;
type Story = StoryObj<typeof TaskGroups>;

export const Empty: Story = {};

const flatPersonRecords = mockedPersonRecords.map((record) =>
  getRecordFromRecordNode({ recordNode: record }),
);

export const WithTasks: Story = {
  args: {
    targetableObject: {
      id: flatPersonRecords[0].id,
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
