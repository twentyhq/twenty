import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { FormFieldRow } from 'twenty-ui/components/input';
import { Text } from 'twenty-ui/primitives/typography';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AiChatTimePickerExample } from '@/ai/components/__stories__/AiChatTimePickerExample';
import { AI_CHAT_TIME_PICKER_FIXTURE } from '@/ai/components/__stories__/aiChatTimePickerFixture';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { ARGOS_CAPTURE_DISABLED } from '~/testing/constants/ArgosCaptureDisabled';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { RootDecorator } from '~/testing/decorators/RootDecorator';

const meta = {
  title: 'Modules/AI/AiChatTimePickerCard',
  component: AiChatTimePickerExample,
  decorators: [ComponentDecorator, MemoryRouterDecorator, RootDecorator],
  parameters: { container: { width: 688 }, argos: { fitToContent: false } },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('combobox', { name: 'Month' });
  },
  args: {
    onDateChange: fn(),
    onViewedMonthChange: fn(),
    onSlotChange: fn(),
    onSendInvite: fn(),
    onSkip: fn(),
    onRetry: fn(),
  },
} satisfies Meta<typeof AiChatTimePickerExample>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { initialSelectedSlotId: 'slot-1100' },
};

export const LocalizedTimeAndDate: Story = {
  args: {
    timeZone: 'America/Los_Angeles',
    timeFormat: TimeFormat.HOUR_12,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Wednesday, October 7')).toBeVisible();
    await expect(
      canvas.getByText('(GMT-07:00) Pacific Daylight Time - Los Angeles'),
    ).toBeVisible();
    await expect(
      canvas.getByRole('radio', { name: /12:30 AM.*1:00 AM/ }),
    ).toBeVisible();
  },
};

export const MidnightUsesZeroHour: Story = {
  args: { timeZone: 'America/Los_Angeles' },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('radio', { name: '00:30 – 01:00' }),
    ).toBeVisible();
  },
};

export const DaylightSavingSelection: Story = {
  args: {
    timeZone: 'America/Los_Angeles',
    initialDate: '2026-11-01',
    initialViewedMonth: '2026-11',
    initialSelectedSlotId: 'before-clock-change',
    initialAvailability: {
      status: 'ready',
      date: '2026-11-01',
      slots: [
        {
          id: 'before-clock-change',
          startsAt: '2026-11-01T08:00:00Z',
          endsAt: '2026-11-01T08:30:00Z',
        },
        {
          id: 'after-clock-change',
          startsAt: '2026-11-01T09:00:00Z',
          endsAt: '2026-11-01T09:30:00Z',
        },
      ],
    },
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText('(GMT-07:00) Pacific Daylight Time - Los Angeles'),
    ).toBeVisible();
    await expect(
      canvas.getByRole('radio', { name: '01:00 PDT – 01:30 PDT' }),
    ).toBeChecked();
    await userEvent.click(
      canvas.getByRole('radio', { name: '01:00 PST – 01:30 PST' }),
    );
    await expect(
      canvas.getByText('(GMT-08:00) Pacific Standard Time - Los Angeles'),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Send invite' }));
    await expect(args.onSendInvite).toHaveBeenCalledWith({
      date: '2026-11-01',
      slotId: 'after-clock-change',
      timeZone: 'America/Los_Angeles',
    });
  },
};

export const SystemTimeZone: Story = {
  args: { timeZone: 'system', initialSelectedSlotId: 'slot-1100' },
  parameters: { argos: ARGOS_CAPTURE_DISABLED },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Send invite' }));
    await expect(args.onSendInvite).toHaveBeenCalledWith({
      date: AI_CHAT_TIME_PICKER_FIXTURE.date,
      slotId: 'slot-1100',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  },
};

export const NoDateSelected: Story = {
  args: { initialDate: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Choose a date')).toBeVisible();
    await expect(
      canvas.getByText('Choose a date to see available times.'),
    ).toBeVisible();
    await expect(
      canvas.queryByRole('button', { name: 'Refresh' }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Send invite' }),
    ).toBeDisabled();
  },
};

export const SelectAndSend: Story = {
  args: { initialSelectedSlotId: null },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const sendInvite = canvas.getByRole('button', { name: 'Send invite' });
    const recommendedTime = canvas.getByRole('radio', { name: /11:00.*11:30/ });

    await expect(sendInvite).toBeDisabled();
    await userEvent.click(recommendedTime);
    await expect(recommendedTime).toBeChecked();
    await expect(args.onSlotChange).toHaveBeenCalledWith('slot-1100');
    await expect(sendInvite).toBeEnabled();
    await userEvent.click(sendInvite);
    await expect(args.onSendInvite).toHaveBeenCalledTimes(1);
    await expect(args.onSendInvite).toHaveBeenCalledWith({
      date: AI_CHAT_TIME_PICKER_FIXTURE.date,
      slotId: 'slot-1100',
      timeZone: AI_CHAT_TIME_PICKER_FIXTURE.timeZone,
    });
  },
};

export const BrowseMonthAndChangeDate: Story = {
  args: { initialSelectedSlotId: 'slot-1100' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const sendInvite = canvas.getByRole('button', { name: 'Send invite' });

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Next month' }),
    );
    await waitFor(() =>
      expect(args.onViewedMonthChange).toHaveBeenCalledWith('2026-11'),
    );
    await expect(
      canvas.getByRole('radio', { name: /11:00.*11:30/ }),
    ).toBeChecked();
    await expect(sendInvite).toBeEnabled();
    await expect(args.onDateChange).not.toHaveBeenCalled();
    await expect(args.onSlotChange).not.toHaveBeenCalled();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Previous month' }),
    );
    await userEvent.click(
      await canvas.findByRole('gridcell', {
        name: 'Choose Thursday, October 8th, 2026',
      }),
    );
    await waitFor(() =>
      expect(args.onDateChange).toHaveBeenCalledWith('2026-10-08'),
    );
    await expect(args.onSlotChange).toHaveBeenCalledTimes(1);
    await expect(args.onSlotChange).toHaveBeenCalledWith(null);
    await expect(sendInvite).toBeDisabled();
    await expect(canvas.queryByRole('radio')).not.toBeInTheDocument();
    await expect(args.onSendInvite).not.toHaveBeenCalled();
  },
};

export const StaleAvailability: Story = {
  args: {
    initialDate: '2026-10-08',
    initialSelectedSlotId: 'slot-1100',
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const sendInvite = canvas.getByRole('button', { name: 'Send invite' });

    await expect(canvas.queryByRole('radio')).not.toBeInTheDocument();
    await expect(sendInvite).toBeDisabled();
    await userEvent.click(sendInvite);
    await expect(args.onSendInvite).not.toHaveBeenCalled();
    await expect(
      canvas.getByText('Refresh availability for this date.'),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Refresh' }));
    await expect(args.onRetry).toHaveBeenCalledTimes(1);
  },
};

export const AvailabilityChanged: Story = {
  args: {
    initialSelectedSlotId: 'slot-1100',
    availabilityAfterRefresh: {
      status: 'ready',
      date: AI_CHAT_TIME_PICKER_FIXTURE.date,
      slots: AI_CHAT_TIME_PICKER_FIXTURE.availability.slots.filter(
        ({ id }) => id !== 'slot-1100',
      ),
    },
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const sendInvite = canvas.getByRole('button', { name: 'Send invite' });

    await expect(sendInvite).toBeEnabled();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Refresh availability' }),
    );
    await expect(
      canvas.getByText(
        'That time is no longer available. Choose another time.',
      ),
    ).toBeVisible();
    await expect(sendInvite).toBeDisabled();
    await expect(
      canvas.queryByRole('radio', { name: /11:00.*11:30/ }),
    ).not.toBeInTheDocument();
    await expect(args.onSendInvite).not.toHaveBeenCalled();

    const afternoonTime = canvas.getByRole('radio', { name: /14:00.*14:30/ });

    await userEvent.click(afternoonTime);
    await expect(afternoonTime).toBeChecked();
    await expect(
      canvas.queryByText(
        'That time is no longer available. Choose another time.',
      ),
    ).not.toBeInTheDocument();
    await expect(sendInvite).toBeEnabled();
    await userEvent.click(sendInvite);
    await expect(args.onSendInvite).toHaveBeenCalledTimes(1);
    await expect(args.onSendInvite).toHaveBeenCalledWith({
      date: AI_CHAT_TIME_PICKER_FIXTURE.date,
      slotId: 'slot-1400',
      timeZone: AI_CHAT_TIME_PICKER_FIXTURE.timeZone,
    });
  },
};

export const AvailabilityError: Story = {
  args: {
    initialAvailability: {
      status: 'error',
      date: AI_CHAT_TIME_PICKER_FIXTURE.date,
      message: 'Your calendar could not be reached.',
    },
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText('Your calendar could not be reached.'),
    ).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Send invite' }),
    ).toBeDisabled();
    await userEvent.click(canvas.getByRole('button', { name: 'Try again' }));
    await expect(args.onRetry).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole('button', { name: 'Skip' }));
    await expect(args.onSkip).toHaveBeenCalledTimes(1);
    await expect(args.onSendInvite).not.toHaveBeenCalled();

    await userEvent.click(
      await canvas.findByRole('gridcell', {
        name: 'Choose Thursday, October 8th, 2026',
      }),
    );
    await expect(
      canvas.queryByText('Your calendar could not be reached.'),
    ).not.toBeInTheDocument();
    await expect(
      canvas.getByText('Refresh availability for this date.'),
    ).toBeVisible();
  },
};

export const Disabled: Story = {
  args: { disabled: true, initialSelectedSlotId: 'slot-1100' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('button', { name: 'Send invite' }),
    ).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Skip' })).toBeDisabled();
    await expect(
      await canvas.findByRole('button', { name: 'Next month' }),
    ).toBeDisabled();
    await expect(
      canvas.getByRole('combobox', { name: 'Month' }),
    ).toBeDisabled();
    await userEvent.click(canvas.getByRole('radio', { name: /14:00.*14:30/ }));
    await userEvent.click(
      canvas.getByRole('gridcell', {
        name: 'Not available Thursday, October 8th, 2026',
      }),
    );
    await expect(args.onSlotChange).not.toHaveBeenCalled();
    await expect(args.onDateChange).not.toHaveBeenCalled();
    await expect(args.onSendInvite).not.toHaveBeenCalled();
  },
};

export const Sending: Story = {
  args: { isSending: true, initialSelectedSlotId: 'slot-1100' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const sendInvite = canvas.getByRole('button', { name: 'Send invite' });

    await expect(sendInvite).toBeDisabled();
    await expect(sendInvite).toHaveAttribute('aria-busy', 'true');
    await expect(canvas.getByRole('button', { name: 'Skip' })).toBeDisabled();
    await expect(
      await canvas.findByRole('button', { name: 'Next month' }),
    ).toBeDisabled();
    await userEvent.click(sendInvite);
    await expect(args.onSendInvite).not.toHaveBeenCalled();
  },
};

export const Loading: Story = {
  args: {
    initialAvailability: {
      status: 'loading',
      date: AI_CHAT_TIME_PICKER_FIXTURE.date,
    },
  },
};

export const Empty: Story = {
  args: {
    initialAvailability: {
      status: 'ready',
      date: AI_CHAT_TIME_PICKER_FIXTURE.date,
      slots: [],
    },
  },
};

export const UncheckedAttendees: Story = {
  args: {
    uncheckedAttendees: ['alex@acme.com'],
    initialSelectedSlotId: 'slot-1100',
  },
};

export const CalendarReviewFields: Story = {
  args: {
    reviewFields: (
      <>
        <FormFieldRow label="Time zone">
          <Text>Europe/Paris</Text>
        </FormFieldRow>
        <FormFieldRow label="Availability calendars">
          <Text>Work calendar, Personal calendar</Text>
        </FormFieldRow>
        <FormFieldRow label="Organizer" hasDivider={false}>
          <Text>raphael@twenty.com</Text>
        </FormFieldRow>
      </>
    ),
  },
};

export const Narrow: Story = {
  parameters: { container: { width: 344 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByRole('gridcell', {
      name: 'Choose Wednesday, October 7th, 2026',
    });

    const card = canvas.getByRole('group', {
      name: 'Call with Patrick Collison · 30 min',
    });
    const calendar = within(card).getByRole('group', { name: 'Choose a date' });
    const times = canvas.getByRole('radiogroup', { name: 'Available times' });
    const calendarBounds = calendar.getBoundingClientRect();
    const timesBounds = times.getBoundingClientRect();
    const cardBounds = card.getBoundingClientRect();

    await expect(timesBounds.top).toBeGreaterThanOrEqual(calendarBounds.bottom);
    await expect(timesBounds.right).toBeLessThanOrEqual(cardBounds.right);
    await expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth);
  },
};
