import { type Meta, type StoryObj } from '@storybook/react-vite';

import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { RecordFieldsScopeContextProvider } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import { RecordDetailRelationSection } from '@/object-record/record-field-list/record-detail-section/relation/components/RecordDetailRelationSection';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { ComponentDecorator } from 'twenty-ui/testing';
import { PageLayoutType } from '~/generated-metadata/graphql';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { RecordStoreDecorator } from '~/testing/decorators/RecordStoreDecorator';
import { SidePanelDecorator } from '~/testing/decorators/SidePanelDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedCompanyRecords } from '~/testing/mock-data/generated/data/companies/mock-companies-data';
import { mockedPersonRecords } from '~/testing/mock-data/generated/data/people/mock-people-data';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const mockedCompanyObjectMetadataItem =
  getTestEnrichedObjectMetadataItemsMock().find(
    (item) => item.nameSingular === 'company',
  );

if (!mockedCompanyObjectMetadataItem) {
  throw new Error('Company object metadata item not found');
}

const meta: Meta<typeof RecordDetailRelationSection> = {
  title:
    'Modules/ObjectRecord/RecordShow/RecordDetailSection/RecordDetailRelationSection',
  component: RecordDetailRelationSection,
  decorators: [
    (Story) => (
      <LayoutRenderingProvider
        value={{
          targetRecordIdentifier: {
            id: mockedCompanyRecords[0].id,
            targetObjectNameSingular: 'company',
          },
          layoutType: PageLayoutType.RECORD_PAGE,
        }}
      >
        <ContextStoreComponentInstanceContext.Provider
          value={{ instanceId: 'mock-instance-id' }}
        >
          <FieldContext.Provider
            value={{
              recordId: mockedCompanyRecords[0].id,
              isLabelIdentifier: false,
              fieldDefinition: formatFieldMetadataItemAsFieldDefinition({
                field: mockedCompanyObjectMetadataItem.fields.find(
                  ({ name }) => name === 'people',
                )!,
                objectMetadataItem: mockedCompanyObjectMetadataItem,
              }),
              isRecordFieldReadOnly: false,
            }}
          >
            <RecordFieldsScopeContextProvider
              value={{ scopeInstanceId: 'mock-instance-id' }}
            >
              <Story />
            </RecordFieldsScopeContextProvider>
          </FieldContext.Provider>
        </ContextStoreComponentInstanceContext.Provider>
      </LayoutRenderingProvider>
    ),
    SidePanelDecorator,
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    ToastDecorator,
    MemoryRouterDecorator,
  ],
  parameters: {
    msw: graphqlMocks,
    records: mockedCompanyRecords,
  },
};

export default meta;
type Story = StoryObj<typeof RecordDetailRelationSection>;

export const EmptyState: Story = {};

const flatPersonRecords = mockedPersonRecords.map((record) =>
  getRecordFromRecordNode({ recordNode: record }),
);

export const WithRecords: Story = {
  decorators: [RecordStoreDecorator],
  parameters: {
    records: [
      {
        ...mockedCompanyRecords[0],
        people: flatPersonRecords,
      },
      ...flatPersonRecords,
    ],
  },
};
