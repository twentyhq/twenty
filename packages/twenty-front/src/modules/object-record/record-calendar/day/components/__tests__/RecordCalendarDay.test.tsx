import { render, screen } from '@testing-library/react';
import { type Temporal } from 'temporal-polyfill';

import { RecordCalendarDay } from '@/object-record/record-calendar/day/components/RecordCalendarDay';

jest.mock(
  '@/object-record/record-calendar/time-grid/components/RecordCalendarTimeGrid',
  () => ({
    RecordCalendarTimeGrid: ({
      days,
    }: {
      days: { date: Temporal.PlainDate; label: string }[];
    }) => (
      <div data-testid="time-grid" data-day-count={days.length}>
        {days.map(({ date, label }) => `${date.toString()}:${label}`).join(',')}
      </div>
    ),
  }),
);
jest.mock(
  '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow',
  () => ({
    useAvailableComponentInstanceIdOrThrow: jest.fn(() => 'calendar-id'),
  }),
);
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue', () => {
  const { Temporal } = jest.requireActual('temporal-polyfill');

  return {
    useAtomComponentStateValue: jest.fn(() =>
      Temporal.PlainDate.from('2026-07-15'),
    ),
  };
});
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => {
  const { enUS } = jest.requireActual('date-fns/locale');

  return {
    useAtomStateValue: jest.fn(() => ({ localeCatalog: enUS })),
  };
});

describe('RecordCalendarDay', () => {
  it('renders the selected date as the only time-grid day', () => {
    render(<RecordCalendarDay />);

    expect(screen.getByTestId('time-grid')).toHaveAttribute(
      'data-day-count',
      '1',
    );
    expect(screen.getByTestId('time-grid')).toHaveTextContent('2026-07-15:Wed');
  });
});
