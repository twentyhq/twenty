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
    onUpgrade: fn(),
    onUninstall: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof SettingsApplicationActionButton>;

export const Install: Story = {
  args: { isInstalled: false },
};

export const Installing: Story = {
  args: { isInstalled: false, isInstalling: true },
};

export const Upgrade: Story = {
  args: { isInstalled: true, hasUpdate: true, latestAvailableVersion: '2.1.0' },
};

export const Uninstall: Story = {
  args: { isInstalled: true, canBeUninstalled: true },
};

export const Installed: Story = {
  args: { isInstalled: true },
};
