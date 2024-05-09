import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui';

import { FieldMetadataType } from '~/generated-metadata/graphql';
import { FormProviderDecorator } from '~/testing/decorators/FormProviderDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedCompanyObjectMetadataItem } from '~/testing/mock-data/metadata';

import { SettingsDataModelFieldSettingsFormCard } from '../SettingsDataModelFieldSettingsFormCard';

const fieldMetadataItem = mockedCompanyObjectMetadataItem.fields.find(
  ({ type }) => type === FieldMetadataType.Text,
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
  ],
  args: {
    fieldMetadataItem,
    objectMetadataItem: mockedCompanyObjectMetadataItem,
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
    fieldMetadataItem: mockedCompanyObjectMetadataItem.fields.find(
      ({ name }) => name === 'people',
    ),
  },
};

export const WithSelectForm: Story = {
  args: {
    fieldMetadataItem: {
      label: 'Industry',
      icon: 'IconBuildingFactory2',
      type: FieldMetadataType.Select,
    },
  },
};
