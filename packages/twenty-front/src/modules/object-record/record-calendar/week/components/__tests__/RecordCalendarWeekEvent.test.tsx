import { RecordCalendarWeekEvent } from '@/object-record/record-calendar/week/components/RecordCalendarWeekEvent';
import { render, screen } from '@testing-library/react';
import { Temporal } from 'temporal-polyfill';

let viewableRecordId: string | null = null;

jest.mock(
  '@/object-record/record-calendar/contexts/RecordCalendarContext',
  () => ({
    useRecordCalendarContextOrThrow: () => ({
      objectNameSingular: 'opportunity',
    }),
  }),
);
jest.mock('@/object-record/components/RecordChip', () => ({
  RecordChip: () => <span>Event</span>,
}));
jest.mock(
  '@/object-record/record-calendar/record-calendar-card/hooks/useIsRecordCalendarCardDragDisabled',
  () => ({
    useIsRecordCalendarCardDragDisabled: () => false,
  }),
);
jest.mock(
  '@/object-record/record-index/hooks/useOpenRecordFromIndexView',
  () => ({
    useOpenRecordFromIndexView: () => ({
      openRecordFromIndexView: jest.fn(),
    }),
  }),
);
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue', () => ({
  useAtomFamilyStateValue: () => ({
    startsAt: '2026-07-15T09:00:00.000Z',
    endsAt: '2026-07-15T10:00:00.000Z',
  }),
}));
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: () => viewableRecordId,
}));
jest.mock('@dnd-kit/react', () => ({
  useDraggable: () => ({
    isDragSource: false,
    ref: jest.fn(),
  }),
}));
const renderEvent = (endInPixels = 120) =>
  render(
    <RecordCalendarWeekEvent
      calendarDay={Temporal.PlainDate.from('2026-07-15')}
      calendarFieldName="startsAt"
      calendarEndFieldName="endsAt"
      endInPixels={endInPixels}
      recordId="record-1"
      startInPixels={72}
      timeFormat="h:mm a"
      timeZone="UTC"
    />,
  );

describe('RecordCalendarWeekEvent', () => {
  beforeEach(() => {
    viewableRecordId = null;
  });

  it('does not render a selection checkbox', () => {
    renderEvent();

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('shows the time range on expanded events', () => {
    renderEvent();

    expect(screen.getByText('Event')).toBeInTheDocument();
    expect(screen.getByText('9:00 AM - 10:00 AM')).toBeInTheDocument();
  });

  it('shows only the start time on compact events', () => {
    renderEvent(96);

    expect(screen.getByText('Event')).toBeInTheDocument();
    expect(screen.getByText(', 9:00 AM')).toBeInTheDocument();
    expect(screen.queryByText(/10:00 AM/)).not.toBeInTheDocument();
  });

  it('stays focused only while its record is open in the side panel', () => {
    viewableRecordId = 'record-1';
    const { container, rerender } = renderEvent();

    expect(
      container.querySelector('[data-focused="true"]'),
    ).toBeInTheDocument();

    viewableRecordId = 'record-2';
    rerender(
      <RecordCalendarWeekEvent
        calendarDay={Temporal.PlainDate.from('2026-07-15')}
        calendarFieldName="startsAt"
        endInPixels={120}
        recordId="record-1"
        startInPixels={72}
        timeFormat="h:mm a"
        timeZone="UTC"
      />,
    );

    expect(container.querySelector('[data-focused="true"]')).toBeNull();

    viewableRecordId = null;
    rerender(
      <RecordCalendarWeekEvent
        calendarDay={Temporal.PlainDate.from('2026-07-15')}
        calendarFieldName="startsAt"
        endInPixels={120}
        recordId="record-1"
        startInPixels={72}
        timeFormat="h:mm a"
        timeZone="UTC"
      />,
    );

    expect(container.querySelector('[data-focused="true"]')).toBeNull();
  });
});
