import { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { SettingsObjectFormSection } from '../SettingsObjectFormSection';

const meta: Meta<typeof SettingsObjectFormSection> = {
  title: 'Modules/Settings/DataModel/SettingsObjectFormSection',
  component: SettingsObjectFormSection,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof SettingsObjectFormSection>;

export const Default: Story = {};

export const WithDefaultValues: Story = {
  args: {
    singularName: 'Company',
    pluralName: 'Companies',
    description: 'Lorem ipsum',
  },
};
