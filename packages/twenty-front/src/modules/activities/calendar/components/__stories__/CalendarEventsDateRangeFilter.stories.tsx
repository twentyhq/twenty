import { CalendarEventsDateRangeFilter } from '@/activities/calendar/components/CalendarEventsDateRangeFilter';
import { type CalendarEventsCustomDateRange } from '@/activities/calendar/types/CalendarEventsCustomDateRange';
import { type CalendarEventsDateRangePreset } from '@/activities/calendar/types/CalendarEventsDateRangePreset';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

type CalendarEventsDateRangeFilterStoryProps = {
  initialPreset: CalendarEventsDateRangePreset;
  initialCustomDateRange: CalendarEventsCustomDateRange;
  onPresetChange: (preset: CalendarEventsDateRangePreset) => void;
};

const StatefulCalendarEventsDateRangeFilter = ({
  initialPreset,
  initialCustomDateRange,
  onPresetChange,
}: CalendarEventsDateRangeFilterStoryProps) => {
  const [preset, setPreset] = useState(initialPreset);
  const [customDateRange, setCustomDateRange] = useState(
    initialCustomDateRange,
  );

  const handlePresetChange = (newPreset: CalendarEventsDateRangePreset) => {
    onPresetChange(newPreset);
    setPreset(newPreset);
  };

  return (
    <CalendarEventsDateRangeFilter
      instanceId="story"
      preset={preset}
      customDateRange={customDateRange}
      onPresetChange={handlePresetChange}
      onCustomDateRangeChange={setCustomDateRange}
    />
  );
};

const meta: Meta<typeof StatefulCalendarEventsDateRangeFilter> = {
  title: 'Modules/Activities/Calendar/CalendarEventsDateRangeFilter',
  component: StatefulCalendarEventsDateRangeFilter,
  decorators: [ComponentDecorator],
  args: {
    initialPreset: 'ALL',
    initialCustomDateRange: {},
    onPresetChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof StatefulCalendarEventsDateRangeFilter>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('All time')).toBeVisible();
    expect(canvas.queryByText('Start date')).not.toBeInTheDocument();
  },
};

export const SwitchesToCustomRange: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const screen = within(canvasElement.ownerDocument.body);

    await userEvent.click(await canvas.findByText('All time'));
    await userEvent.click(await screen.findByText('Custom range'));

    expect(args.onPresetChange).toHaveBeenCalledWith('CUSTOM');
    expect(await canvas.findByText('Start date')).toBeVisible();
    expect(await canvas.findByText('End date')).toBeVisible();
  },
};

export const CustomRange: Story = {
  args: {
    initialPreset: 'CUSTOM',
    initialCustomDateRange: {
      startPlainDate: '2026-03-01',
      endPlainDate: '2026-03-31',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Mar 1, 2026')).toBeVisible();
    expect(await canvas.findByText('Mar 31, 2026')).toBeVisible();
  },
};
