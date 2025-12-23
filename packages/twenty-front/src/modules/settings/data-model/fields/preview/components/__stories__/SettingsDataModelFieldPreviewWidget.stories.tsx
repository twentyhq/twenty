import { type Meta, type StoryObj } from '@storybook/react';

import { FieldMetadataType } from '~/generated-metadata/graphql';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { ComponentDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { SettingsDataModelFieldPreviewWidget } from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewWidget';

const mockedCompanyObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('company');

const mockedOpportunityObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('opportunity');

const mockedPersonObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('person');

const meta: Meta<typeof SettingsDataModelFieldPreviewWidget> = {
  title:
    'Modules/Settings/DataModel/Fields/Preview/SettingsDataModelFieldPreviewWidget',
  component: SettingsDataModelFieldPreviewWidget,
  decorators: [
    I18nFrontDecorator,
    MemoryRouterDecorator,
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    I18nFrontDecorator,
    SnackBarDecorator,
  ],
  args: {
    objectNameSingular: mockedPersonObjectMetadataItem.nameSingular,
  },
  parameters: {
    container: { width: 480 },
    msw: graphqlMocks,
  },
};

export default meta;
type Story = StoryObj<typeof SettingsDataModelFieldPreviewWidget>;

export const LabelIdentifier: Story = {
  args: {
    fieldMetadataItem: mockedPersonObjectMetadataItem.fields.find(
      ({ name, type }) =>
        name === 'name' && type === FieldMetadataType.FULL_NAME,
    ),
  },
};

export const Text: Story = {
  args: {
    fieldMetadataItem: mockedPersonObjectMetadataItem.fields.find(
      ({ name, type }) => name === 'city' && type === FieldMetadataType.TEXT,
    ),
  },
};

export const Boolean: Story = {
  args: {
    fieldMetadataItem: mockedCompanyObjectMetadataItem.fields.find(
      ({ name, type }) =>
        name === 'idealCustomerProfile' && type === FieldMetadataType.BOOLEAN,
    ),
    objectNameSingular: mockedCompanyObjectMetadataItem.nameSingular,
  },
};

export const Currency: Story = {
  args: {
    fieldMetadataItem: mockedCompanyObjectMetadataItem.fields.find(
      ({ name, type }) =>
        name === 'annualRecurringRevenue' &&
        type === FieldMetadataType.CURRENCY,
    ),
    objectNameSingular: mockedCompanyObjectMetadataItem.nameSingular,
  },
};

export const Date: Story = {
  args: {
    fieldMetadataItem: mockedCompanyObjectMetadataItem.fields.find(
      ({ type }) => type === FieldMetadataType.DATE_TIME,
    ),
    objectNameSingular: mockedCompanyObjectMetadataItem.nameSingular,
  },
};

export const Links: Story = {
  args: {
    fieldMetadataItem: mockedCompanyObjectMetadataItem.fields.find(
      ({ name, type }) =>
        name === 'linkedinLink' && type === FieldMetadataType.LINKS,
    ),
    objectNameSingular: mockedCompanyObjectMetadataItem.nameSingular,
  },
};

export const Number: Story = {
  args: {
    fieldMetadataItem: mockedCompanyObjectMetadataItem?.fields.find(
      ({ type }) => type === FieldMetadataType.NUMBER,
    ),
    objectNameSingular: mockedCompanyObjectMetadataItem.nameSingular,
  },
};

export const Rating: Story = {
  args: {
    fieldMetadataItem: {
      icon: 'IconHandClick',
      label: 'Engagement',
      type: FieldMetadataType.RATING,
    },
  },
};

export const Relation: Story = {
  args: {
    fieldMetadataItem: mockedPersonObjectMetadataItem?.fields.find(
      ({ name }) => name === 'company',
    ),
    objectNameSingular: mockedPersonObjectMetadataItem.nameSingular,
  },
};

const selectFieldMetadataItem = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: mockedOpportunityObjectMetadataItem,
  fieldName: 'stage',
});

export const Select: Story = {
  args: {
    fieldMetadataItem: selectFieldMetadataItem,
    objectNameSingular: mockedOpportunityObjectMetadataItem.nameSingular,
  },
};

export const MultiSelect: Story = {
  args: {
    objectNameSingular: mockedOpportunityObjectMetadataItem.nameSingular,
    fieldMetadataItem: {
      ...structuredClone(selectFieldMetadataItem),
      type: FieldMetadataType.MULTI_SELECT,
    },
  },
};
