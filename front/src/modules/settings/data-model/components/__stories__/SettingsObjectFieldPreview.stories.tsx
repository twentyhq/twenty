import { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { SettingsObjectFieldPreview } from '../SettingsObjectFieldPreview';

const meta: Meta<typeof SettingsObjectFieldPreview> = {
  title: 'Modules/Settings/DataModel/SettingsObjectFieldPreview',
  component: SettingsObjectFieldPreview,
  decorators: [ComponentDecorator],
  args: {
    fieldIconKey: 'IconNotes',
    fieldLabel: 'Description',
    fieldType: 'TEXT',
    objectIconKey: 'IconUser',
    objectLabelPlural: 'People',
    objectNamePlural: 'people',
  },
};

export default meta;
type Story = StoryObj<typeof SettingsObjectFieldPreview>;

export const StandardObject: Story = { args: { isObjectCustom: false } };

export const CustomObject: Story = { args: { isObjectCustom: true } };
