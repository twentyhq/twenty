import { RecordCalendarMonthBodyDay } from '@/object-record/record-calendar/month/components/RecordCalendarMonthBodyDay';
import { render, screen } from '@testing-library/react';
import { Temporal } from 'temporal-polyfill';

jest.mock('@/ui/input/components/internal/date/hooks/useUserTimezone', () => ({
  useUserTimezone: () => ({ userTimezone: 'UTC' }),
}));
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({
    useAtomComponentStateValue: () => Temporal.PlainDate.from('2026-07-15'),
  }),
);
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue',
  () => ({
    useAtomComponentFamilySelectorValue: () => [
      'first',
      'second',
      'third',
      'fourth',
      'fifth',
      'sixth',
    ],
  }),
);
jest.mock('@dnd-kit/react', () => ({
  useDroppable: () => ({
    isDropTarget: false,
    ref: jest.fn(),
  }),
}));
jest.mock(
  '@/object-record/record-calendar/components/RecordCalendarAddNew',
  () => ({
    RecordCalendarAddNew: () => <div />,
  }),
);
jest.mock(
  '@/ui/utilities/drag-and-drop/components/DragDropItemDropTarget',
  () => ({
    DragDropItemDropTarget: () => null,
  }),
);
jest.mock(
  '@/object-record/record-calendar/record-calendar-card/components/RecordCalendarCardDraggableContainer',
  () => ({
    RecordCalendarCardDraggableContainer: ({
      recordId,
    }: {
      recordId: string;
    }) => <div data-testid="month-card" data-record-id={recordId} />,
  }),
);

describe('RecordCalendarMonthBodyDay', () => {
  it('shows the number of records hidden by the month cell limit', () => {
    render(
      <RecordCalendarMonthBodyDay
        day={Temporal.PlainDate.from('2026-07-15')}
      />,
    );

    expect(
      screen
        .getAllByTestId('month-card')
        .map((element) => element.dataset.recordId),
    ).toEqual(['first', 'second', 'third']);
    expect(screen.getByText('+3')).toBeInTheDocument();
  });
});
