import { type Meta, type StoryObj } from '@storybook/react-vite';

import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { ChipFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/ChipFieldDisplay';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ChipGeneratorsDecorator } from '~/testing/decorators/ChipGeneratorsDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { getFieldDecorator } from '~/testing/decorators/getFieldDecorator';
import { getProfilingStory } from '~/testing/profiling/utils/getProfilingStory';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

const recordIndexInstanceId = 'child-field-display-scope';

const companyObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === CoreObjectNameSingular.Company,
)!;

const fieldMetadataItemByFieldMetadataItemId = Object.fromEntries(
  companyObjectMetadataItem.fields.map((fieldMetadataItem) => [
    fieldMetadataItem.id,
    fieldMetadataItem,
  ]),
);

const recordFieldByFieldMetadataItemId: Record<string, RecordField> = {};

const fieldDefinitionByFieldMetadataItemId = Object.fromEntries(
  companyObjectMetadataItem.fields.map((fieldMetadataItem) => [
    fieldMetadataItem.id,
    formatFieldMetadataItemAsColumnDefinition({
      field: fieldMetadataItem,
      objectMetadataItem: companyObjectMetadataItem,
      position: 0,
      labelWidth: 0,
    }),
  ]),
);

const labelIdentifierFieldMetadataItem = companyObjectMetadataItem.fields.find(
  (fieldMetadataItem) =>
    isLabelIdentifierField({
      fieldMetadataItem,
      objectMetadataItem: companyObjectMetadataItem,
    }),
);

const recordIndexContextValue = {
  objectPermissionsByObjectMetadataId: {},
  indexIdentifierUrl: () => '',
  onIndexRecordsLoaded: () => {},
  objectNamePlural: CoreObjectNamePlural.Company,
  objectNameSingular: CoreObjectNameSingular.Company,
  objectMetadataItem: companyObjectMetadataItem,
  recordIndexId: recordIndexInstanceId,
  viewBarInstanceId: recordIndexInstanceId,
  fieldDefinitionByFieldMetadataItemId,
  fieldMetadataItemByFieldMetadataItemId,
  labelIdentifierFieldMetadataItem,
  recordFieldByFieldMetadataItemId,
};

const meta: Meta = {
  title: 'UI/Data/Field/Display/ChipFieldDisplay',
  decorators: [
    (Story) => {
      return (
        <RecordTableComponentInstanceContext.Provider
          value={{
            instanceId: recordIndexInstanceId,
          }}
        >
          <RecordIndexContextProvider value={recordIndexContextValue}>
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
