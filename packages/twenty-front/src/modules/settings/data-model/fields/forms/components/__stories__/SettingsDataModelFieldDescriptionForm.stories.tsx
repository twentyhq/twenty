import { type Meta, type StoryObj } from '@storybook/react';

import { FormProviderDecorator } from '~/testing/decorators/FormProviderDecorator';

import { ComponentDecorator } from 'twenty-ui/testing';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import { SettingsDataModelFieldDescriptionForm } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldDescriptionForm';

const meta: Meta<typeof SettingsDataModelFieldDescriptionForm> = {
  title: 'Modules/Settings/DataModel/SettingsDataModelFieldDescriptionForm',
  component: SettingsDataModelFieldDescriptionForm,
  decorators: [
    (Story) => (
      <div style={{ flex: 1 }}>
        <Story />
      </div>
    ),
    FormProviderDecorator,
    ComponentDecorator,
  ],
};

export default meta;
type Story = StoryObj<typeof SettingsDataModelFieldDescriptionForm>;

export const Default: Story = {};

const mockedPersonObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.namePlural === 'person',
);

export const WithFieldMetadataItem: Story = {
  args: {
    fieldMetadataItem: mockedPersonObjectMetadataItem?.fields.find(
      ({ description }) => description === 'description',
    ),
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
