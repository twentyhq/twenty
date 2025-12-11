import { type Meta, type StoryObj } from '@storybook/react';

import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ChipFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/ChipFieldDisplay';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordIndexFieldMetadataDerivedStates } from '@/object-record/record-index/hooks/useRecordIndexFieldMetadataDerivedStates';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ChipGeneratorsDecorator } from '~/testing/decorators/ChipGeneratorsDecorator';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { getFieldDecorator } from '~/testing/decorators/getFieldDecorator';
import { getProfilingStory } from '~/testing/profiling/utils/getProfilingStory';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

const meta: Meta = {
  title: 'UI/Data/Field/Display/ChipFieldDisplay',
  decorators: [
    ContextStoreDecorator,
    (Story) => {
      const instanceId = 'child-field-display-scope';

      const companyObjectMetadataItem = generatedMockObjectMetadataItems.find(
        (item) => item.nameSingular === CoreObjectNameSingular.Company,
      )!;

      const {
        fieldDefinitionByFieldMetadataItemId,
        fieldMetadataItemByFieldMetadataItemId,
        labelIdentifierFieldMetadataItem,
        recordFieldByFieldMetadataItemId,
      } = useRecordIndexFieldMetadataDerivedStates(
        companyObjectMetadataItem,
        instanceId,
      );

      return (
        <RecordTableComponentInstanceContext.Provider
          value={{
            instanceId,
          }}
        >
          <RecordIndexContextProvider
            value={{
              objectPermissionsByObjectMetadataId: {},
              indexIdentifierUrl: () => '',
              onIndexRecordsLoaded: () => {},
              objectNamePlural: CoreObjectNamePlural.Company,
              objectNameSingular: CoreObjectNameSingular.Company,
              objectMetadataItem: companyObjectMetadataItem,
              recordIndexId: instanceId,
              viewBarInstanceId: instanceId,
              fieldDefinitionByFieldMetadataItemId,
              fieldMetadataItemByFieldMetadataItemId,
              labelIdentifierFieldMetadataItem,
              recordFieldByFieldMetadataItemId,
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
