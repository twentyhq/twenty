import { describe, expect, it } from 'vitest';

import { computeRealMeetingKey } from 'src/logic-functions/domain/compute-real-meeting-key.util';

const STARTS_AT = '2026-01-01T13:00:00.000Z';

const buildInput = (
  overrides: Partial<Parameters<typeof computeRealMeetingKey>[0]> = {},
) => ({
  calendarEventId: 'calendar-event-1',
  conferenceLinkUrl: 'https://meet.example.com/customer-sync',
  iCalUid: 'calendar-event-uid',
  startsAt: STARTS_AT,
  ...overrides,
});

describe('computeRealMeetingKey', () => {
  it.each([
    [
      'strips protocol, query, and fragment',
      'https://zoom.us/j/123?pwd=abc#section',
      `link:zoom.us/j/123:${STARTS_AT}`,
    ],
    [
      'strips www and lowercases',
      'HTTPS://WWW.Meet.Example.com/Customer-Sync',
      `link:meet.example.com/customer-sync:${STARTS_AT}`,
    ],
    [
      'strips trailing slashes',
      'https://meet.example.com/customer-sync///',
      `link:meet.example.com/customer-sync:${STARTS_AT}`,
    ],
    [
      'supports plain http links',
      'http://meet.example.com/customer-sync',
      `link:meet.example.com/customer-sync:${STARTS_AT}`,
    ],
  ])('%s', (_label, conferenceLinkUrl, expectedKey) => {
    expect(computeRealMeetingKey(buildInput({ conferenceLinkUrl }))).toBe(
      expectedKey,
    );
  });

  it('produces the same key for the same meeting synced from two calendars', () => {
    const fromFirstAttendee = computeRealMeetingKey(
      buildInput({
        calendarEventId: 'calendar-event-1',
        conferenceLinkUrl: 'https://zoom.us/j/123?pwd=first-attendee-token',
      }),
    );
    const fromSecondAttendee = computeRealMeetingKey(
      buildInput({
        calendarEventId: 'calendar-event-2',
        conferenceLinkUrl:
          'https://www.zoom.us/j/123?pwd=second-attendee-token',
      }),
    );

    expect(fromFirstAttendee).toBe(fromSecondAttendee);
  });

  it('falls back to the iCal uid when the link is blank', () => {
    expect(
      computeRealMeetingKey(buildInput({ conferenceLinkUrl: '   ' })),
    ).toBe(`ical:calendar-event-uid:${STARTS_AT}`);
  });

  it('falls back to the iCal uid when the link is not a string', () => {
    expect(computeRealMeetingKey(buildInput({ conferenceLinkUrl: 42 }))).toBe(
      `ical:calendar-event-uid:${STARTS_AT}`,
    );
  });

  it('falls back to the calendar event id when link and iCal uid are missing', () => {
    expect(
      computeRealMeetingKey(
        buildInput({ conferenceLinkUrl: undefined, iCalUid: '' }),
      ),
    ).toBe('event:calendar-event-1');
  });

  it('keeps link keys distinct across start times', () => {
    expect(computeRealMeetingKey(buildInput({ startsAt: undefined }))).toBe(
      'link:meet.example.com/customer-sync:',
    );
  });
});
