import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

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

const checkTrackingChoices = async ({
  canvasElement,
  keepLabel,
}: {
  canvasElement: HTMLElement;
  keepLabel: string;
}) => {
  const canvas = within(canvasElement);
  const keepTracking = canvas.getByRole('radio', { name: keepLabel });
  const optOut = canvas.getByRole('radio', { name: 'Opt out of tracking' });

  await expect(keepTracking).toBeChecked();
  await expect(optOut).not.toBeChecked();
  await userEvent.click(optOut);
  await expect(optOut).toBeChecked();
  await expect(keepTracking).not.toBeChecked();
  keepTracking.focus();
  await userEvent.keyboard(' ');
  await expect(keepTracking).toBeChecked();
  await expect(optOut).not.toBeChecked();
};

export const OpensAndClicks: Story = {
  play: async ({ canvasElement }) => {
    await checkTrackingChoices({
      canvasElement,
      keepLabel: 'Keep tracking my opens and clicks',
    });
  },
};

export const OpensOnly: Story = {
  args: { isClickTrackingEnabled: false },
  play: async ({ canvasElement }) => {
    await checkTrackingChoices({
      canvasElement,
      keepLabel: 'Keep tracking my opens',
    });
  },
};

export const ClicksOnly: Story = {
  args: { isOpenTrackingEnabled: false },
  play: async ({ canvasElement }) => {
    await checkTrackingChoices({
      canvasElement,
      keepLabel: 'Keep tracking my clicks',
    });
  },
};
