import { type Meta, type StoryObj } from '@storybook/react';

import { FieldMetadataType } from '~/generated-metadata/graphql';
import { FormProviderDecorator } from '~/testing/decorators/FormProviderDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { ComponentDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import { SettingsDataModelFieldSettingsFormCard } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldSettingsFormCard';

const mockedCompanyObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'company',
);

if (!mockedCompanyObjectMetadataItem) {
  throw new Error('Company object metadata item not found');
}

const fieldMetadataItem = mockedCompanyObjectMetadataItem.fields.find(
  ({ type }) => type === FieldMetadataType.TEXT,
)!;

const meta: Meta<typeof SettingsDataModelFieldSettingsFormCard> = {
  title:
    'Modules/Settings/DataModel/Fields/Forms/SettingsDataModelFieldSettingsFormCard',
  component: SettingsDataModelFieldSettingsFormCard,
  decorators: [
    MemoryRouterDecorator,
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
    FormProviderDecorator,
    I18nFrontDecorator,
  ],
  args: {
    existingFieldMetadataId: fieldMetadataItem.id,
    fieldType: FieldMetadataType.TEXT,
    objectNameSingular: mockedCompanyObjectMetadataItem.nameSingular,
  },
  parameters: {
    container: { width: 512 },
    msw: graphqlMocks,
  },
};

export default meta;
type Story = StoryObj<typeof SettingsDataModelFieldSettingsFormCard>;

export const Default: Story = {};

export const WithRelationForm: Story = {
  args: {
    existingFieldMetadataId: 'new-field',
    fieldType: FieldMetadataType.RELATION,
    objectNameSingular: 'company',
  },
};

export const WithSelectForm: Story = {
  args: {
    existingFieldMetadataId: 'new-field',
    fieldType: FieldMetadataType.SELECT,
    objectNameSingular: 'company',
  },
};
