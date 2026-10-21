import { type Meta, type StoryObj } from '@storybook/react-vite';
import { within } from 'storybook/test';

import { SettingsTranslationsCard } from '@/settings/translations/components/SettingsTranslationsCard';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';

const meta: Meta<typeof SettingsTranslationsCard> = {
  title: 'Modules/Settings/Translations/SettingsTranslationsCard',
  component: SettingsTranslationsCard,
  decorators: [ComponentWithRouterDecorator],
  args: {
    objectNamePlural: 'companies',
  },
};

export default meta;
type Story = StoryObj<typeof SettingsTranslationsCard>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Edit translations');
  },
};
