import { CalendarSystem } from '@/localization/constants/CalendarSystem';
import { workspaceMemberFormatPreferencesState } from '@/localization/states/workspaceMemberFormatPreferencesState';
import { DatePicker } from '@/ui/input/components/internal/date/components/DatePicker';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useStore } from 'jotai';
import { type ReactNode, useEffect, useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { type RelativeDateFilter } from 'twenty-shared/utils';
import { ComponentDecorator } from 'twenty-ui/testing';

const INITIAL_PLAIN_DATE = '2023-01-01';

const RELATIVE_DATE: RelativeDateFilter & { start: string; end: string } = {
  direction: 'PAST',
  amount: 7,
  unit: 'DAY',
  start: '2022-12-25',
  end: '2023-01-01',
};

const DatePickerStory = ({
  isRelative,
  clearable,
}: {
  isRelative?: boolean;
  clearable?: boolean;
}) => {
  const [plainDateString, setPlainDateString] = useState<string | null>(
    INITIAL_PLAIN_DATE,
  );

  return (
    <DatePicker
      instanceId="story-date-picker"
      plainDateString={plainDateString}
      onChange={setPlainDateString}
      clearable={clearable}
      isRelative={isRelative}
      relativeDate={isRelative ? RELATIVE_DATE : undefined}
    />
  );
};

const WithCalendarSystem = ({
  calendarSystem,
  children,
}: {
  calendarSystem: CalendarSystem;
  children: ReactNode;
}) => {
  const store = useStore();
  const [isCalendarSystemApplied, setIsCalendarSystemApplied] = useState(false);

  useEffect(() => {
    const previousFormatPreferences = store.get(
      workspaceMemberFormatPreferencesState.atom,
    );

    store.set(workspaceMemberFormatPreferencesState.atom, {
      ...previousFormatPreferences,
      calendarSystem,
    });
    setIsCalendarSystemApplied(true);

    return () => {
      store.set(
        workspaceMemberFormatPreferencesState.atom,
        previousFormatPreferences,
      );
    };
  }, [calendarSystem, store]);

  return isCalendarSystemApplied ? children : null;
};

const meta: Meta<typeof DatePicker> = {
  title: 'UI/Input/Internal/Date/DatePicker',
  component: DatePicker,
  decorators: [ComponentDecorator],
  render: () => <DatePickerStory />,
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('15');
  },
};

export const NotClearable: Story = {
  render: () => <DatePickerStory clearable={false} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('15');
    expect(canvas.queryByText('Clear')).not.toBeInTheDocument();
  },
};

export const Relative: Story = {
  render: () => <DatePickerStory isRelative />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('15');
  },
};

export const WithOpenMonthSelect: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    const monthSelect = await canvas.findByText(
      'January',
      {},
      { timeout: 10000 },
    );
    await userEvent.click(monthSelect);

    for (const monthLabel of ['February', 'June', 'December']) {
      expect(await body.findByText(monthLabel)).toBeInTheDocument();
    }
  },
};

export const WithOpenYearSelect: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    const yearSelect = await canvas.findByText('2023');
    await userEvent.click(yearSelect);

    for (const yearLabel of ['2022', '2024']) {
      expect(await body.findByText(yearLabel)).toBeInTheDocument();
    }
  },
};

export const PersianCalendar: Story = {
  render: () => (
    <WithCalendarSystem calendarSystem={CalendarSystem.PERSIAN}>
      <DatePickerStory />
    </WithCalendarSystem>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Dey')).toBeInTheDocument();
    expect(await canvas.findByDisplayValue(/1401/)).toBeInTheDocument();
    expect(await canvas.findByText('1401')).toBeInTheDocument();
    expect(
      await canvas.findByRole('button', { name: /Dey 11, 1401/ }),
    ).toBeInTheDocument();
  },
};
