import { Meta, StoryObj } from '@storybook/react';

import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { RecordStoreDecorator } from '~/testing/decorators/RecordStoreDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { getCompaniesMock } from '~/testing/mock-data/companies';

import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { ComponentDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { allMockPersonRecords } from '~/testing/mock-data/people';
import { RecordDetailRelationSection } from '../RecordDetailRelationSection';

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
            isReadOnly: false,
          }}
        >
          <Story />
        </FieldContext.Provider>
      </ContextStoreComponentInstanceContext.Provider>
    ),
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
    MemoryRouterDecorator,
    I18nFrontDecorator,
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
