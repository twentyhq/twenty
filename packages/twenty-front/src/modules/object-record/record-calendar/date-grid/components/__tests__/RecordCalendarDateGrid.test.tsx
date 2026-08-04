import { RecordCalendarDateGrid } from '@/object-record/record-calendar/date-grid/components/RecordCalendarDateGrid';
import { render, screen } from '@testing-library/react';
import { Temporal } from 'temporal-polyfill';

const mockUseAtomComponentFamilySelectorValue = jest.fn();

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue',
  () => ({
    useAtomComponentFamilySelectorValue: (...args: unknown[]) =>
      mockUseAtomComponentFamilySelectorValue(...args),
  }),
);
jest.mock(
  '@/object-record/record-calendar/record-calendar-card/components/RecordCalendarCard',
  () => ({
    RecordCalendarCard: ({ recordId }: { recordId: string }) => (
      <div data-testid="date-card" data-record-id={recordId} />
    ),
  }),
);
jest.mock(
  '@/object-record/record-calendar/components/RecordCalendarAddNew',
  () => ({
    RecordCalendarAddNew: () => <div data-testid="add-record" />,
  }),
);

describe('RecordCalendarDateGrid', () => {
  it('renders every date record as a list in its day column', () => {
    mockUseAtomComponentFamilySelectorValue.mockImplementation(
      (_selector, { day }: { day: Temporal.PlainDate }) =>
        day.day === 15 ? ['first', 'second', 'third'] : ['fourth'],
    );

    render(
      <RecordCalendarDateGrid
        days={[
          {
            date: Temporal.PlainDate.from('2026-07-15'),
            label: 'Wed',
          },
          {
            date: Temporal.PlainDate.from('2026-07-16'),
            label: 'Thu',
          },
        ]}
        minWidthInPixels={1000}
        timeZone="UTC"
      />,
    );

    expect(screen.getByText('Wed')).toBeInTheDocument();
    expect(screen.getByText('Thu')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('16')).toBeInTheDocument();
    expect(
      screen
        .getAllByTestId('date-card')
        .map((element) => element.dataset.recordId),
    ).toEqual(['first', 'second', 'third', 'fourth']);
    expect(screen.queryByText('All day')).not.toBeInTheDocument();
  });
});
