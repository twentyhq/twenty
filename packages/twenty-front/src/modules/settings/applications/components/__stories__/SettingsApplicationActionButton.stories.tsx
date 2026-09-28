import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';

import { SettingsApplicationActionButton } from '@/settings/applications/components/SettingsApplicationActionButton';
import { ComponentDecorator } from 'twenty-ui/testing';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { RootDecorator } from '~/testing/decorators/RootDecorator';

const INSTALLED_APPLICATION_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

const meta: Meta<typeof SettingsApplicationActionButton> = {
  title: 'Modules/Settings/Applications/SettingsApplicationActionButton',
  component: SettingsApplicationActionButton,
  decorators: [RootDecorator, ComponentDecorator, MemoryRouterDecorator],
  args: {
    canInstallMarketplaceApps: true,
    onInstall: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof SettingsApplicationActionButton>;

export const Install: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByRole('button', { name: /^Install\b/ }),
    ).toBeEnabled();
  },
};

export const Installing: Story = {
  args: { isInstalling: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByRole('button', { name: /^Installing\b/ }),
    ).toBeDisabled();
  },
};

export const Installed: Story = {
  args: { installedApplicationId: INSTALLED_APPLICATION_ID },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByRole('link', { name: /^Open settings\b/ }),
    ).toHaveAttribute(
      'href',
      `/settings/applications/${INSTALLED_APPLICATION_ID}`,
    );
  },
};
