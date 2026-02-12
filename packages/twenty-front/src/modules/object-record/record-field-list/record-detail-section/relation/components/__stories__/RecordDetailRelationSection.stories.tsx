import { type Meta, type StoryObj } from '@storybook/react-vite';

import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { RecordStoreDecorator } from '~/testing/decorators/RecordStoreDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { getCompaniesMock } from '~/testing/mock-data/companies';

import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { RecordFieldsScopeContextProvider } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import { RecordDetailRelationSection } from '@/object-record/record-field-list/record-detail-section/relation/components/RecordDetailRelationSection';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { ComponentDecorator } from 'twenty-ui/testing';
import { PageLayoutType } from '~/generated-metadata/graphql';
import { RightDrawerDecorator } from '~/testing/decorators/RightDrawerDecorator';
import { allMockPersonRecords } from '~/testing/mock-data/people';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

const companiesMock = getCompaniesMock();

const mockedCompanyObjectMetadataItem = generatedMockObjectMetadataItems.find(
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
            id: companiesMock[0].id,
            targetObjectNameSingular: 'company',
          },
          layoutType: PageLayoutType.RECORD_PAGE,
          isInRightDrawer: false,
        }}
      >
        <ContextStoreComponentInstanceContext.Provider
          value={{ instanceId: 'mock-instance-id' }}
        >
          <FieldContext.Provider
            value={{
              recordId: companiesMock[0].id,
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
    RightDrawerDecorator,
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
    MemoryRouterDecorator,
  ],
  parameters: {
    msw: graphqlMocks,
    records: companiesMock,
  },
};

export default meta;
type Story = StoryObj<typeof RecordDetailRelationSection>;

export const EmptyState: Story = {};

export const WithRecords: Story = {
  decorators: [RecordStoreDecorator],
  parameters: {
    records: [
      {
        ...companiesMock[0],
        people: allMockPersonRecords,
      },
      ...allMockPersonRecords,
    ],
  },
};
