import { describe, expect, it } from 'vitest';

import { parseCallRecordingMeetingCardInput } from 'src/front-components/utils/parse-call-recording-meeting-card-input.util';

describe('parseCallRecordingMeetingCardInput', () => {
  it('reads the recording, the meeting and its times', () => {
    expect(
      parseCallRecordingMeetingCardInput({
        callRecordingId: 'call-recording-1',
        calendarEventId: 'calendar-event-1',
        startsAt: '2026-11-27T10:00:00.000Z',
        endsAt: '2026-11-27T10:45:00.000Z',
      }),
    ).toEqual({
      callRecordingId: 'call-recording-1',
      calendarEventId: 'calendar-event-1',
      startsAt: '2026-11-27T10:00:00.000Z',
      endsAt: '2026-11-27T10:45:00.000Z',
    });
  });

  it('drops times that are not strings', () => {
    expect(
      parseCallRecordingMeetingCardInput({
        callRecordingId: 'call-recording-1',
        calendarEventId: 'calendar-event-1',
        startsAt: 42,
        endsAt: null,
      }),
    ).toEqual({
      callRecordingId: 'call-recording-1',
      calendarEventId: 'calendar-event-1',
      startsAt: undefined,
      endsAt: undefined,
    });
  });

  it.each([
    undefined,
    null,
    'call-recording-1',
    { calendarEventId: 'calendar-event-1' },
    { callRecordingId: 'call-recording-1' },
    { callRecordingId: '', calendarEventId: 'calendar-event-1' },
  ])('returns nothing for %j', (value) => {
    expect(parseCallRecordingMeetingCardInput(value)).toBeUndefined();
  });
});
