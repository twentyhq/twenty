import { type Meta, type StoryObj } from '@storybook/react-vite';
import { within } from 'storybook/test';

import { SettingsTranslationsButton } from '@/settings/translations/components/SettingsTranslationsButton';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof SettingsTranslationsButton> = {
  title: 'Modules/Settings/Translations/SettingsTranslationsButton',
  component: SettingsTranslationsButton,
  decorators: [ComponentDecorator],
  args: {
    target: {
      metadataName: 'objectMetadata',
      recordId: 'object-metadata-id',
      label: 'Companies',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SettingsTranslationsButton>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Edit translations');
  },
};
