import { Meta, StoryObj } from '@storybook/react';

import { mockedPersonObjectMetadataItem } from '@/object-record/record-field/__mocks__/fieldDefinitions';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { SettingsDataModelFieldAboutForm } from '../SettingsDataModelFieldAboutForm';

const meta: Meta<typeof SettingsDataModelFieldAboutForm> = {
  title: 'Modules/Settings/DataModel/SettingsDataModelFieldAboutForm',
  component: SettingsDataModelFieldAboutForm,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof SettingsDataModelFieldAboutForm>;

export const Default: Story = {};

export const WithDefaultValues: Story = {
  args: {
    fieldMetadataItem: mockedPersonObjectMetadataItem.fields.find(
      ({ name }) => name === 'name',
    )!,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
