import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui';

import { FieldMetadataType } from '~/generated-metadata/graphql';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { SettingsDataModelFieldPreviewCard } from '../SettingsDataModelFieldPreviewCard';

const mockedCompanyObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'company',
);

const mockedOpportunityObjectMetadataItem =
  generatedMockObjectMetadataItems.find(
    (item) => item.nameSingular === 'opportunity',
  );

const mockedPersonObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'person',
);

const meta: Meta<typeof SettingsDataModelFieldPreviewCard> = {
  title:
    'Modules/Settings/DataModel/Fields/Preview/SettingsDataModelFieldPreviewCard',
  component: SettingsDataModelFieldPreviewCard,
  decorators: [
    MemoryRouterDecorator,
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
  ],
  args: {
    objectMetadataItem: mockedPersonObjectMetadataItem,
  },
  parameters: {
    container: { width: 480 },
    msw: graphqlMocks,
  },
};

export default meta;
type Story = StoryObj<typeof SettingsDataModelFieldPreviewCard>;

export const LabelIdentifier: Story = {
  args: {
    fieldMetadataItem: mockedPersonObjectMetadataItem?.fields.find(
      ({ name, type }) =>
        name === 'name' && type === FieldMetadataType.FullName,
    ),
  },
};

export const Text: Story = {
  args: {
    fieldMetadataItem: mockedPersonObjectMetadataItem?.fields.find(
      ({ name, type }) => name === 'city' && type === FieldMetadataType.Text,
    ),
  },
};

export const Boolean: Story = {
  args: {
    fieldMetadataItem: mockedCompanyObjectMetadataItem?.fields.find(
      ({ name, type }) =>
        name === 'idealCustomerProfile' && type === FieldMetadataType.Boolean,
    ),
    objectMetadataItem: mockedCompanyObjectMetadataItem,
  },
};

export const Currency: Story = {
  args: {
    fieldMetadataItem: mockedCompanyObjectMetadataItem?.fields.find(
      ({ name, type }) =>
        name === 'annualRecurringRevenue' &&
        type === FieldMetadataType.Currency,
    ),
    objectMetadataItem: mockedCompanyObjectMetadataItem,
  },
};

export const Date: Story = {
  args: {
    fieldMetadataItem: mockedCompanyObjectMetadataItem?.fields.find(
      ({ type }) => type === FieldMetadataType.DateTime,
    ),
    objectMetadataItem: mockedCompanyObjectMetadataItem,
  },
};

export const Links: Story = {
  args: {
    fieldMetadataItem: mockedCompanyObjectMetadataItem?.fields.find(
      ({ name, type }) =>
        name === 'linkedinLink' && type === FieldMetadataType.Links,
    ),
    objectMetadataItem: mockedCompanyObjectMetadataItem,
  },
};

export const Number: Story = {
  args: {
    fieldMetadataItem: mockedCompanyObjectMetadataItem?.fields.find(
      ({ type }) => type === FieldMetadataType.Number,
    ),
    objectMetadataItem: mockedCompanyObjectMetadataItem,
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
  args: {
    fieldMetadataItem: mockedPersonObjectMetadataItem?.fields.find(
      ({ name }) => name === 'company',
    ),
    relationObjectMetadataItem: mockedCompanyObjectMetadataItem,
  },
};

export const Select: Story = {
  args: {
    fieldMetadataItem: mockedOpportunityObjectMetadataItem?.fields.find(
      ({ name, type }) => name === 'stage' && type === FieldMetadataType.Select,
    ),
    objectMetadataItem: mockedOpportunityObjectMetadataItem,
  },
};

export const MultiSelect: Story = {
  args: {
    ...Select.args,
    fieldMetadataItem: {
      ...Select.args!.fieldMetadataItem!,
      defaultValue: null,
      label: 'Stages',
      type: FieldMetadataType.MultiSelect,
    },
  },
};
