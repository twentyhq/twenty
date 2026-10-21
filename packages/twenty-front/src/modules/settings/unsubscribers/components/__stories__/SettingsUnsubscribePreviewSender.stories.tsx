import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { SettingsUnsubscribePreviewSender } from '@/settings/unsubscribers/components/SettingsUnsubscribePreviewSender';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof SettingsUnsubscribePreviewSender> = {
  title: 'Modules/Settings/Unsubscribers/SettingsUnsubscribePreviewSender',
  component: SettingsUnsubscribePreviewSender,
  decorators: [ComponentDecorator],
  args: {
    workspaceName: 'Apple',
    workspaceLogo: 'https://twenty-icons.com/apple.com',
  },
};

export default meta;
type Story = StoryObj<typeof SettingsUnsubscribePreviewSender>;

export const WithLogo: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Apple')).toBeVisible();
    await expect(await canvas.findByAltText('')).toBeVisible();
  },
};

export const NameOnly: Story = {
  args: { workspaceLogo: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Apple')).toBeVisible();
    await expect(canvas.queryByAltText('')).not.toBeInTheDocument();
  },
};

export const LogoOnly: Story = {
  args: { workspaceName: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByAltText('')).toBeVisible();
    await expect(canvas.queryByText('Apple')).not.toBeInTheDocument();
  },
};

export const UnknownSender: Story = {
  args: { workspaceName: null, workspaceLogo: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByText('Apple')).not.toBeInTheDocument();
    await expect(canvas.queryByAltText('')).not.toBeInTheDocument();
  },
};
