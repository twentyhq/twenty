import { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { SettingsObjectFieldPreview } from '../SettingsObjectFieldPreview';

const meta: Meta<typeof SettingsObjectFieldPreview> = {
  title: 'Modules/Settings/DataModel/SettingsObjectFieldPreview',
  component: SettingsObjectFieldPreview,
  decorators: [ComponentDecorator],
  args: {
    objectIconKey: 'IconUser',
    objectLabelPlural: 'People',
    fieldIconKey: 'IconNotes',
    fieldLabel: 'Description',
    fieldValue:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum magna enim, dapibus non enim in, lacinia faucibus nunc. Sed interdum ante sed felis facilisis, eget ultricies neque molestie. Mauris auctor, justo eu volutpat cursus, libero erat tempus nulla, non sodales lorem lacus a est.',
  },
};

export default meta;
type Story = StoryObj<typeof SettingsObjectFieldPreview>;

export const StandardObject: Story = { args: { isObjectCustom: false } };

export const CustomObject: Story = { args: { isObjectCustom: true } };
