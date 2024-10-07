import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui';

import { FormProviderDecorator } from '~/testing/decorators/FormProviderDecorator';

import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { SettingsDataModelFieldDescriptionForm } from '../SettingsDataModelFieldDescriptionForm';

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
