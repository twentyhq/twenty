import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui';

import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { RecordStoreDecorator } from '~/testing/decorators/RecordStoreDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { getCompaniesMock } from '~/testing/mock-data/companies';
import { getPeopleMock } from '~/testing/mock-data/people';

import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { RecordDetailRelationSection } from '../RecordDetailRelationSection';

const companiesMock = getCompaniesMock();

const peopleMock = getPeopleMock();

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
          hotkeyScope: 'hotkey-scope',
        }}
      >
        <Story />
      </FieldContext.Provider>
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
        people: peopleMock,
      },
      ...peopleMock,
    ],
  },
};
