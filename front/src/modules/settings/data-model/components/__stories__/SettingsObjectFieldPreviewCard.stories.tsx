import { Meta, StoryObj } from '@storybook/react';

import { TextInput } from '@/ui/input/components/TextInput';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { SettingsObjectFieldPreview } from '../SettingsObjectFieldPreview';
import { SettingsObjectFieldPreviewCard } from '../SettingsObjectFieldPreviewCard';

const meta: Meta<typeof SettingsObjectFieldPreviewCard> = {
  title: 'Modules/Settings/DataModel/SettingsObjectFieldPreviewCard',
  component: SettingsObjectFieldPreviewCard,
  decorators: [ComponentDecorator],
  args: {
    preview: (
      <SettingsObjectFieldPreview
        objectIconKey="IconUser"
        objectLabelPlural="People"
        isObjectCustom={false}
        fieldIconKey="IconNotes"
        fieldLabel="Description"
        fieldValue="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum magna enim, dapibus non enim in, lacinia faucibus nunc. Sed interdum ante sed felis facilisis, eget ultricies neque molestie. Mauris auctor, justo eu volutpat cursus, libero erat tempus nulla, non sodales lorem lacus a est."
      />
    ),
  },
};

export default meta;
type Story = StoryObj<typeof SettingsObjectFieldPreviewCard>;

export const Default: Story = {};

export const WithForm: Story = {
  args: { form: <TextInput label="Lorem ipsum" placeholder="Lorem ipsum" /> },
};
