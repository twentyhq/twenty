import { type Meta, type StoryObj } from '@storybook/react-vite';
import { within } from 'storybook/test';

import { SettingsTranslationsButton } from '@/settings/translations/components/SettingsTranslationsButton';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';

const meta: Meta<typeof SettingsTranslationsButton> = {
  title: 'Modules/Settings/Translations/SettingsTranslationsButton',
  component: SettingsTranslationsButton,
  decorators: [ComponentWithRouterDecorator],
  args: {
    objectNamePlural: 'companies',
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
