import { type Meta, type StoryObj } from '@storybook/react-vite';

import { SettingsUnsubscribePreviewTracking } from '@/settings/unsubscribers/components/SettingsUnsubscribePreviewTracking';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof SettingsUnsubscribePreviewTracking> = {
  title: 'Modules/Settings/Unsubscribers/SettingsUnsubscribePreviewTracking',
  component: SettingsUnsubscribePreviewTracking,
  decorators: [ComponentDecorator],
  args: {
    senderName: 'Apple',
    isOpenTrackingEnabled: true,
    isClickTrackingEnabled: true,
  },
};

export default meta;
type Story = StoryObj<typeof SettingsUnsubscribePreviewTracking>;

export const OpensAndClicks: Story = {};

export const OpensOnly: Story = {
  args: { isClickTrackingEnabled: false },
};

export const ClicksOnly: Story = {
  args: { isOpenTrackingEnabled: false },
};
