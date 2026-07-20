import { render, screen } from '@testing-library/react';
import { Temporal } from 'temporal-polyfill';

import { RecordCalendarTimeGridAllDayCell } from '@/object-record/record-calendar/time-grid/components/RecordCalendarTimeGridAllDayCell';
import { FieldMetadataType } from '~/generated-metadata/graphql';

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
      <div data-testid="all-day-card" data-record-id={recordId} />
    ),
  }),
);

describe('RecordCalendarTimeGridAllDayCell', () => {
  it('renders every all-day record in order', () => {
    mockUseAtomComponentFamilySelectorValue.mockReturnValue([
      'first',
      'second',
      'third',
      'fourth',
      'fifth',
    ]);

    render(
      <RecordCalendarTimeGridAllDayCell
        calendarFieldType={FieldMetadataType.DATE}
        day={Temporal.PlainDate.from('2026-07-15')}
        timeZone="UTC"
      />,
    );

    expect(
      screen
        .getAllByTestId('all-day-card')
        .map((element) => element.dataset.recordId),
    ).toEqual(['first', 'second', 'third', 'fourth', 'fifth']);
    expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
  });

  it('does not render DATE_TIME records in the all-day cell', () => {
    mockUseAtomComponentFamilySelectorValue.mockReturnValue(['first']);

    render(
      <RecordCalendarTimeGridAllDayCell
        calendarFieldType={FieldMetadataType.DATE_TIME}
        day={Temporal.PlainDate.from('2026-07-15')}
        timeZone="UTC"
      />,
    );

    expect(screen.queryByTestId('all-day-card')).not.toBeInTheDocument();
  });
});
