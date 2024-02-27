import { Meta, StoryObj } from '@storybook/react';

import {
  mockedCompanyObjectMetadataItem,
  mockedPersonObjectMetadataItem,
} from '@/object-record/record-field/__mocks__/fieldDefinitions';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { RecordStoreDecorator } from '~/testing/decorators/RecordStoreDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { SettingsDataModelFieldPreviewCard } from '../SettingsDataModelFieldPreviewCard';

const meta: Meta<typeof SettingsDataModelFieldPreviewCard> = {
  title: 'Modules/Settings/DataModel/SettingsDataModelFieldPreviewCard',
  component: SettingsDataModelFieldPreviewCard,
  decorators: [
    RecordStoreDecorator,
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
  ],
  args: {
    fieldMetadataItem: mockedCompanyObjectMetadataItem.fields.find(
      ({ type }) => type === FieldMetadataType.Text,
    ),
    objectMetadataItem: mockedCompanyObjectMetadataItem,
  },
  parameters: {
    container: { width: 480 },
    records: [
      {
        id: `${mockedCompanyObjectMetadataItem.id}-field-form`,
        domainName: 'Test',
        idealCustomerProfile: true,
        annualRecurringRevenue: {
          amountMicros: 1000000,
          currency: 'USD',
        },
        updatedAt: '2021-08-05T14:00:00.000Z',
        linkedinLink: {
          label: 'LinkedIn',
          url: 'https://linkedin.com',
        },
        employees: 100,
      },
    ],
    msw: graphqlMocks,
  },
};

export default meta;
type Story = StoryObj<typeof SettingsDataModelFieldPreviewCard>;

export const Text: Story = {};

export const Boolean: Story = {
  args: {
    fieldMetadataItem: mockedCompanyObjectMetadataItem.fields.find(
      ({ type }) => type === FieldMetadataType.Boolean,
    ),
  },
};

export const Currency: Story = {
  args: {
    fieldMetadataItem: mockedCompanyObjectMetadataItem.fields.find(
      ({ type }) => type === FieldMetadataType.Currency,
    ),
  },
};

export const Date: Story = {
  args: {
    fieldMetadataItem: mockedCompanyObjectMetadataItem.fields.find(
      ({ type }) => type === FieldMetadataType.DateTime,
    ),
  },
};

export const Link: Story = {
  decorators: [MemoryRouterDecorator],
  args: {
    fieldMetadataItem: mockedCompanyObjectMetadataItem.fields.find(
      ({ type }) => type === FieldMetadataType.Link,
    ),
  },
};

export const Number: Story = {
  args: {
    fieldMetadataItem: mockedCompanyObjectMetadataItem.fields.find(
      ({ type }) => type === FieldMetadataType.Number,
    ),
  },
};

export const Rating: Story = {
  args: {
    fieldMetadataItem: {
      icon: 'IconHandClick',
      label: 'Engagement',
      type: FieldMetadataType.Rating,
    },
  },
};

export const Relation: Story = {
  decorators: [MemoryRouterDecorator],
  args: {
    fieldMetadataItem: mockedPersonObjectMetadataItem.fields.find(
      ({ name }) => name === 'company',
    ),
    objectMetadataItem: mockedPersonObjectMetadataItem,
    relationObjectMetadataItem: mockedCompanyObjectMetadataItem,
  },
};

export const CustomObject: Story = {
  args: {
    fieldMetadataItem: mockedCompanyObjectMetadataItem.fields.find(
      ({ isCustom }) => isCustom,
    ),
    objectMetadataItem: mockedCompanyObjectMetadataItem,
  },
};
