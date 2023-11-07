import { Meta, StoryObj } from '@storybook/react';

import { TextInput } from '@/ui/input/components/TextInput';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { SettingsObjectFieldPreview } from '../SettingsObjectFieldPreview';
import { SettingsObjectFieldTypeCard } from '../SettingsObjectFieldTypeCard';

const meta: Meta<typeof SettingsObjectFieldTypeCard> = {
  title: 'Modules/Settings/DataModel/SettingsObjectFieldTypeCard',
  component: SettingsObjectFieldTypeCard,
  decorators: [ComponentDecorator],
  args: {
    preview: (
      <SettingsObjectFieldPreview
        fieldIconKey="IconNotes"
        fieldLabel="Description"
        fieldType="TEXT"
        isObjectCustom={false}
        objectIconKey="IconUser"
        objectLabelPlural="People"
        objectNamePlural="people"
      />
    ),
  },
};

export default meta;
type Story = StoryObj<typeof SettingsObjectFieldTypeCard>;

export const Default: Story = {};

export const WithForm: Story = {
  args: { form: <TextInput label="Lorem ipsum" placeholder="Lorem ipsum" /> },
};
