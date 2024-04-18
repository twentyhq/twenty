import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui';

import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { RecordStoreDecorator } from '~/testing/decorators/RecordStoreDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedCompaniesData } from '~/testing/mock-data/companies';
import { mockedCompanyObjectMetadataItem } from '~/testing/mock-data/metadata';
import { mockedPeopleData } from '~/testing/mock-data/people';

import { RecordDetailRelationSection } from '../RecordDetailRelationSection';

const meta: Meta<typeof RecordDetailRelationSection> = {
  title:
    'Modules/ObjectRecord/RecordShow/RecordDetailSection/RecordDetailRelationSection',
  component: RecordDetailRelationSection,
  decorators: [
    (Story) => (
      <FieldContext.Provider
        value={{
          entityId: mockedCompaniesData[0].id,
          basePathToShowPage: '/object-record/',
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
  ],
  parameters: {
    msw: graphqlMocks,
    records: mockedCompaniesData,
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
        ...mockedCompaniesData[0],
        people: mockedPeopleData,
      },
      ...mockedPeopleData,
    ],
  },
};
