import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { ChatMessageTime } from '@/chat/components/ChatMessageTime';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { workspaceMemberFormatPreferencesState } from '@/localization/states/workspaceMemberFormatPreferencesState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

const setFormatPreferences = ({
  timeZone,
  timeFormat,
}: {
  timeZone: string;
  timeFormat: TimeFormat;
}) =>
  jotaiStore.set(
    workspaceMemberFormatPreferencesState.atom,
    (formatPreferences) => ({ ...formatPreferences, timeZone, timeFormat }),
  );

const meta: Meta<typeof ChatMessageTime> = {
  title: 'Modules/Chat/ChatMessageTime',
  component: ChatMessageTime,
  decorators: [ComponentDecorator],
  args: { date: '2026-11-07T14:07:00.000Z' },
};

export default meta;
type Story = StoryObj<typeof ChatMessageTime>;

export const Hour24InParis: Story = {
  beforeEach: () => {
    setFormatPreferences({
      timeZone: 'Europe/Paris',
      timeFormat: TimeFormat.HOUR_24,
    });
  },
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByText('15:07')).toBeVisible();
  },
};

export const Hour12InNewYork: Story = {
  beforeEach: () => {
    setFormatPreferences({
      timeZone: 'America/New_York',
      timeFormat: TimeFormat.HOUR_12,
    });
  },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText('9:07 AM'),
    ).toBeVisible();
  },
};
