import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { ChatMessageDaySeparator } from '@/chat/components/ChatMessageDaySeparator';
import { DateFormat } from '@/localization/constants/DateFormat';
import { workspaceMemberFormatPreferencesState } from '@/localization/states/workspaceMemberFormatPreferencesState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

const meta: Meta<typeof ChatMessageDaySeparator> = {
  title: 'Modules/Chat/ChatMessageDaySeparator',
  component: ChatMessageDaySeparator,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 400 } },
  args: { date: '2025-03-04T14:07:00.000Z' },
  beforeEach: () => {
    jotaiStore.set(
      workspaceMemberFormatPreferencesState.atom,
      (formatPreferences) => ({
        ...formatPreferences,
        timeZone: 'UTC',
        dateFormat: DateFormat.MONTH_FIRST,
      }),
    );
  },
};

export default meta;
type Story = StoryObj<typeof ChatMessageDaySeparator>;

export const Day: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const separator = await canvas.findByRole('separator', {
      name: 'Mar 4, 2025',
    });

    await expect(within(separator).getByText('Mar 4, 2025')).toBeVisible();
    await expect(within(separator).queryByText('New')).not.toBeInTheDocument();
  },
};

export const FirstUnreadOfDay: Story = {
  args: { isFirstUnread: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const separator = await canvas.findByRole('separator', {
      name: 'Mar 4, 2025, New',
    });

    await expect(within(separator).getByText('Mar 4, 2025')).toBeVisible();
    await expect(within(separator).getByText('New')).toBeVisible();
    await expect(canvas.getAllByRole('separator')).toHaveLength(1);
  },
};
