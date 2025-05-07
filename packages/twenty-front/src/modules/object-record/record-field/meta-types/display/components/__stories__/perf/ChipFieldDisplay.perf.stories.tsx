import { Meta, StoryObj } from '@storybook/react';

import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ChipFieldDisplay } from '@/object-record/record-field/meta-types/display/components/ChipFieldDisplay';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ChipGeneratorsDecorator } from '~/testing/decorators/ChipGeneratorsDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { getFieldDecorator } from '~/testing/decorators/getFieldDecorator';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { getProfilingStory } from '~/testing/profiling/utils/getProfilingStory';

const meta: Meta = {
  title: 'UI/Data/Field/Display/ChipFieldDisplay',
  decorators: [
    (Story) => {
      const instanceId = 'child-field-display-scope';

      const companyObjectMetadataItem = generatedMockObjectMetadataItems.find(
        (item) => item.nameSingular === CoreObjectNameSingular.Company,
      )!;

      return (
        <RecordTableComponentInstanceContext.Provider
          value={{
            instanceId,
            onColumnsChange: () => {},
          }}
        >
          <RecordIndexContextProvider
            value={{
              indexIdentifierUrl: () => '',
              onIndexRecordsLoaded: () => {},
              objectNamePlural: CoreObjectNamePlural.Company,
              objectNameSingular: CoreObjectNameSingular.Company,
              objectMetadataItem: companyObjectMetadataItem,
              recordIndexId: instanceId,
            }}
          >
            <Story />
          </RecordIndexContextProvider>
        </RecordTableComponentInstanceContext.Provider>
      );
    },
    MemoryRouterDecorator,
    ChipGeneratorsDecorator,
    getFieldDecorator('person', 'name'),
    ComponentDecorator,
  ],
  component: ChipFieldDisplay,
  args: {},
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};

export default meta;

type Story = StoryObj<typeof ChipFieldDisplay>;

export const Default: Story = {};

export const Performance = getProfilingStory({
  componentName: 'ChipFieldDisplay',
  averageThresholdInMs: 0.2,
  numberOfRuns: 20,
  numberOfTestsPerRun: 100,
});
