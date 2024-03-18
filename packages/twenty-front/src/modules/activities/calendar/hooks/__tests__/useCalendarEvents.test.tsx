import { act, renderHook } from '@testing-library/react';

import { useCalendarEvents } from '@/activities/calendar/hooks/useCalendarEvents';
import { CalendarEvent } from '@/activities/calendar/types/CalendarEvent';

const calendarEvents: CalendarEvent[] = [
  {
    id: '1234',
    externalCreatedAt: '2024-02-17T20:45:43.854Z',
    isFullDay: false,
    startsAt: '2024-02-17T21:45:27.822Z',
    visibility: 'METADATA',
  },
  {
    id: '5678',
    externalCreatedAt: '2024-02-18T19:43:37.854Z',
    isFullDay: false,
    startsAt: '2024-02-18T21:43:27.754Z',
    visibility: 'SHARE_EVERYTHING',
  },
  {
    id: '91011',
    externalCreatedAt: '2024-02-19T20:45:20.854Z',
    isFullDay: true,
    startsAt: '2024-02-19T22:05:27.653Z',
    visibility: 'METADATA',
  },
  {
    id: '121314',
    externalCreatedAt: '2024-02-20T20:45:12.854Z',
    isFullDay: true,
    startsAt: '2024-02-20T23:15:23.150Z',
    visibility: 'SHARE_EVERYTHING',
  },
];

describe('useCalendar', () => {
  it('returns calendar events', () => {
    const { result } = renderHook(() => useCalendarEvents(calendarEvents));

    expect(result.current.currentCalendarEvent).toBe(calendarEvents[0]);

    expect(result.current.getNextCalendarEvent(calendarEvents[1])).toBe(
      calendarEvents[0],
    );

    act(() => {
      result.current.updateCurrentCalendarEvent();
    });

    expect(result.current.currentCalendarEvent).toBe(calendarEvents[0]);
  });
});
