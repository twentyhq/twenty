import { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { ComponentDecorator } from 'twenty-ui';

import { fieldMetadataFormDefaultValues } from '@/settings/data-model/fields/forms/hooks/useFieldMetadataForm';
import {
  FieldMetadataType,
  RelationMetadataType,
} from '~/generated-metadata/graphql';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import {
  mockedCompanyObjectMetadataItem,
  mockedPersonObjectMetadataItem,
} from '~/testing/mock-data/metadata';

import { SettingsDataModelFieldSettingsFormCard } from '../SettingsDataModelFieldSettingsFormCard';

const fieldMetadataItem = mockedCompanyObjectMetadataItem.fields.find(
  ({ type }) => type === FieldMetadataType.Text,
)!;

const defaultValues = {
  currency: fieldMetadataFormDefaultValues.currency,
  relation: fieldMetadataFormDefaultValues.relation,
  select: fieldMetadataFormDefaultValues.select,
  multiSelect: fieldMetadataFormDefaultValues.multiSelect,
  defaultValue: fieldMetadataFormDefaultValues.defaultValue,
};

const meta: Meta<typeof SettingsDataModelFieldSettingsFormCard> = {
  title:
    'Modules/Settings/DataModel/Fields/Forms/SettingsDataModelFieldSettingsFormCard',
  component: SettingsDataModelFieldSettingsFormCard,
  decorators: [
    MemoryRouterDecorator,
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
  ],
  args: {
    fieldMetadataItem,
    objectMetadataItem: mockedCompanyObjectMetadataItem,
    onChange: fn(),
    values: defaultValues,
  },
  parameters: {
    container: { width: 512 },
    msw: graphqlMocks,
  },
};

export default meta;
type Story = StoryObj<typeof SettingsDataModelFieldSettingsFormCard>;

export const Default: Story = {};

const relationFieldMetadataItem = mockedPersonObjectMetadataItem.fields.find(
  ({ name }) => name === 'company',
)!;

export const WithRelationForm: Story = {
  args: {
    fieldMetadataItem: mockedCompanyObjectMetadataItem.fields.find(
      ({ name }) => name === 'people',
    ),
    relationFieldMetadataItem,
    values: {
      ...defaultValues,
      relation: {
        field: relationFieldMetadataItem,
        objectMetadataId: mockedPersonObjectMetadataItem.id,
        type: RelationMetadataType.OneToMany,
      },
    },
  },
};

export const WithSelectForm: Story = {
  args: {
    fieldMetadataItem: {
      label: 'Industry',
      icon: 'IconBuildingFactory2',
      type: FieldMetadataType.Select,
    },
    values: {
      ...defaultValues,
      select: [
        {
          color: 'pink',
          isDefault: true,
          label: '💊 Health',
          value: 'HEALTH',
        },
        {
          color: 'purple',
          label: '🏭 Industry',
          value: 'INDUSTRY',
        },
        { color: 'sky', label: '🤖 SaaS', value: 'SAAS' },
        {
          color: 'turquoise',
          label: '🌿 Green tech',
          value: 'GREEN_TECH',
        },
        {
          color: 'yellow',
          label: '🚲 Mobility',
          value: 'MOBILITY',
        },
        { color: 'green', label: '🌏 NGO', value: 'NGO' },
      ],
      defaultValue: undefined,
    },
  },
};
