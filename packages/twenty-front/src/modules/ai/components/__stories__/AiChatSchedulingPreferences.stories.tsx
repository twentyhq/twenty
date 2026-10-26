import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type ComponentProps, useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AiChatSchedulingPreferences } from '@/ai/components/AiChatSchedulingPreferences';
import { type AiChatSchedulingCalendar } from '@/ai/types/AiChatSchedulingCalendar';
import { type AiChatSchedulingPreferencesValue } from '@/ai/types/AiChatSchedulingPreferencesValue';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { RootDecorator } from '~/testing/decorators/RootDecorator';

const CALENDARS: AiChatSchedulingCalendar[] = [
  {
    id: 'work',
    name: 'Work calendar',
    description: 'raphael@twenty.com',
    canOrganize: true,
  },
  {
    id: 'personal',
    name: 'Personal calendar',
    description: 'Private events',
    canOrganize: true,
  },
  { id: 'team', name: 'Team calendar', canOrganize: false },
  {
    id: 'disconnected',
    name: 'Old calendar',
    canOrganize: true,
    isDisabled: true,
  },
];

const PREFERENCES: AiChatSchedulingPreferencesValue = {
  timeZone: 'Europe/Paris',
  workingDays: [1, 2, 3, 4, 5],
  workingHoursStart: '09:00',
  workingHoursEnd: '18:00',
  availabilityCalendarIds: ['work'],
  organizerCalendarId: 'work',
};

const PreferencesExample = ({
  value: initialValue,
  calendars,
  timeZoneOptions,
  onChange,
  isDisabled,
}: ComponentProps<typeof AiChatSchedulingPreferences>) => {
  const [value, setValue] = useState(initialValue);

  return (
    <AiChatSchedulingPreferences
      value={value}
      calendars={calendars}
      timeZoneOptions={timeZoneOptions}
      onChange={(nextValue) => {
        setValue(nextValue);
        onChange(nextValue);
      }}
      isDisabled={isDisabled}
    />
  );
};

const meta = {
  title: 'Modules/AI/AiChatSchedulingPreferences',
  component: PreferencesExample,
  decorators: [ComponentDecorator, MemoryRouterDecorator, RootDecorator],
  parameters: { container: { width: 680 } },
  args: {
    value: PREFERENCES,
    calendars: CALENDARS,
    timeZoneOptions: [
      { value: 'Europe/Paris', label: 'Paris (GMT+01:00)' },
      { value: 'America/New_York', label: 'New York (GMT-05:00)' },
      { value: 'Asia/Tokyo', label: 'Tokyo (GMT+09:00)' },
    ],
    onChange: fn(),
  },
} satisfies Meta<typeof PreferencesExample>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Editable: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('checkbox', { name: 'Monday' }));
    await expect(args.onChange).toHaveBeenLastCalledWith({
      ...PREFERENCES,
      workingDays: [2, 3, 4, 5],
    });

    await userEvent.click(
      canvas.getByRole('checkbox', { name: /Personal calendar/ }),
    );
    await expect(args.onChange).toHaveBeenLastCalledWith({
      ...PREFERENCES,
      workingDays: [2, 3, 4, 5],
      availabilityCalendarIds: ['work', 'personal'],
    });

    await userEvent.click(
      within(canvas.getByRole('group', { name: 'Organizer' })).getByRole(
        'button',
        { name: /Work calendar/ },
      ),
    );
    const page = within(canvasElement.ownerDocument.body);
    await expect(
      page.getByRole('option', { name: /Team calendar/ }),
    ).toBeDisabled();
    await userEvent.click(
      page.getByRole('option', { name: /Personal calendar/ }),
    );
    await expect(args.onChange).toHaveBeenLastCalledWith({
      ...PREFERENCES,
      workingDays: [2, 3, 4, 5],
      availabilityCalendarIds: ['work', 'personal'],
      organizerCalendarId: 'personal',
    });

    const unavailableCalendar = canvas.getByRole('checkbox', {
      name: /Old calendar/,
    });

    await expect(unavailableCalendar).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(unavailableCalendar);
    await expect(args.onChange).toHaveBeenCalledTimes(3);

    await userEvent.type(
      canvas.getByRole('searchbox', { name: 'Search availability calendars' }),
      'Personal',
    );
    await expect(
      canvas.getByRole('checkbox', { name: /Personal calendar/ }),
    ).toBeChecked();
    await expect(
      canvas.queryByRole('checkbox', { name: /Work calendar/ }),
    ).not.toBeInTheDocument();
  },
};

export const SearchTimeZone: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByText('Paris (GMT+01:00)'));
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.type(
      page.getByRole('searchbox', { name: 'Search' }),
      'Tokyo',
    );
    await userEvent.click(
      page.getByRole('option', { name: 'Tokyo (GMT+09:00)' }),
    );
    await expect(args.onChange).toHaveBeenLastCalledWith({
      ...PREFERENCES,
      timeZone: 'Asia/Tokyo',
    });
  },
};

export const InvalidPreferences: Story = {
  args: {
    value: {
      ...PREFERENCES,
      workingDays: [],
      workingHoursStart: '18:00',
      workingHoursEnd: '09:00',
      availabilityCalendarIds: [],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText('Select at least one working day.'),
    ).toBeVisible();
    await expect(
      canvas.getByText('End time must be after start time.'),
    ).toBeVisible();
    await expect(
      canvas.getByText(
        'Select at least one available calendar to check for conflicts.',
      ),
    ).toBeVisible();

    await userEvent.click(canvas.getByRole('checkbox', { name: 'Monday' }));
    await expect(
      canvas.queryByText('Select at least one working day.'),
    ).not.toBeInTheDocument();
  },
};

export const MissingWorkingHours: Story = {
  args: { value: { ...PREFERENCES, workingHoursStart: '' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Enter a start and end time.')).toBeVisible();
    await expect(
      canvas.queryByText('End time must be after start time.'),
    ).not.toBeInTheDocument();
  },
};

export const TimeZoneAlias: Story = {
  args: {
    value: { ...PREFERENCES, timeZone: 'America/Buenos_Aires' },
    timeZoneOptions: [
      { value: 'Europe/Paris', label: 'Paris (GMT+01:00)' },
      {
        value: 'America/Argentina/Buenos_Aires',
        label: 'Buenos Aires (GMT-03:00)',
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Buenos Aires (GMT-03:00)')).toBeVisible();
    await expect(
      canvas.queryByText('Choose a time zone.'),
    ).not.toBeInTheDocument();
  },
};

export const UnlistedTimeZone: Story = {
  args: { value: { ...PREFERENCES, timeZone: 'Europe/Berlin' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText(/Berlin/)).toBeVisible();
    await expect(
      canvas.queryByText('Choose a time zone.'),
    ).not.toBeInTheDocument();
  },
};

export const NoCalendars: Story = {
  args: {
    calendars: [],
    value: {
      ...PREFERENCES,
      availabilityCalendarIds: [],
      organizerCalendarId: '',
    },
  },
};

export const UnavailableSelection: Story = {
  args: {
    value: {
      ...PREFERENCES,
      availabilityCalendarIds: ['work', 'removed', 'disconnected'],
    },
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText('Some selected calendars are no longer available.'),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove unavailable calendars' }),
    );
    await expect(args.onChange).toHaveBeenLastCalledWith(PREFERENCES);
    await expect(
      canvas.queryByText('Some selected calendars are no longer available.'),
    ).not.toBeInTheDocument();
  },
};

export const Disabled: Story = {
  args: { isDisabled: true },
};
