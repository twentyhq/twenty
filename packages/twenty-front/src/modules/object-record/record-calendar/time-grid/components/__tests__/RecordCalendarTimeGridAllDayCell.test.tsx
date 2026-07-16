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
  '@/object-record/record-calendar/week/components/RecordCalendarWeekEvent',
  () => ({
    RecordCalendarWeekEvent: ({
      isAllDay,
      recordId,
    }: {
      isAllDay: boolean;
      recordId: string;
    }) => (
      <div
        data-testid="all-day-event"
        data-is-all-day={isAllDay}
        data-record-id={recordId}
      />
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
        calendarFieldName="date"
        calendarFieldType={FieldMetadataType.DATE}
        day={Temporal.PlainDate.from('2026-07-15')}
        timeFormat="HH:mm"
        timeZone="UTC"
      />,
    );

    expect(
      screen.getAllByTestId('all-day-event').map((element) => ({
        isAllDay: element.dataset.isAllDay,
        recordId: element.dataset.recordId,
      })),
    ).toEqual([
      {
        isAllDay: 'true',
        recordId: 'first',
      },
      {
        isAllDay: 'true',
        recordId: 'second',
      },
      {
        isAllDay: 'true',
        recordId: 'third',
      },
      {
        isAllDay: 'true',
        recordId: 'fourth',
      },
      {
        isAllDay: 'true',
        recordId: 'fifth',
      },
    ]);
    expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
  });
});
