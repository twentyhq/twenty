import { type Meta, type StoryObj } from '@storybook/react-vite';

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

export const WithLogo: Story = {};

export const NameOnly: Story = {
  args: { workspaceLogo: null },
};

export const LogoOnly: Story = {
  args: { workspaceName: null },
};

export const UnknownSender: Story = {
  args: { workspaceName: null, workspaceLogo: null },
};
