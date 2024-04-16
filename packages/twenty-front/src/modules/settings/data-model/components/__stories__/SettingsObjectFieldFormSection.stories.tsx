import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui';

import { SettingsObjectFieldFormSection } from '../SettingsObjectFieldFormSection';

const meta: Meta<typeof SettingsObjectFieldFormSection> = {
  title: 'Modules/Settings/DataModel/SettingsObjectFieldFormSection',
  component: SettingsObjectFieldFormSection,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof SettingsObjectFieldFormSection>;

export const Default: Story = {};

export const WithDefaultValues: Story = {
  args: {
    iconKey: 'IconLink',
    name: 'URL',
    description: 'Lorem ipsum',
  },
};
