import { type Meta, type StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { SettingsApplicationActionButton } from '@/settings/applications/components/SettingsApplicationActionButton';
import { ComponentDecorator } from 'twenty-ui/testing';
import { RootDecorator } from '~/testing/decorators/RootDecorator';

const meta: Meta<typeof SettingsApplicationActionButton> = {
  title: 'Modules/Settings/Applications/SettingsApplicationActionButton',
  component: SettingsApplicationActionButton,
  decorators: [RootDecorator, ComponentDecorator],
  args: {
    canInstallMarketplaceApps: true,
    onInstall: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof SettingsApplicationActionButton>;

export const Install: Story = {};

export const Installing: Story = {
  args: { isInstalling: true },
};

export const Installed: Story = {
  args: { installedApplicationId: '20202020-1c25-4d02-bf25-6aeccf7ea419' },
};
