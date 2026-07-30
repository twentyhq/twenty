import { describe, expect, it } from 'vitest';

import {
  buildRelatedData,
  personLastContact,
} from 'src/utils/last-contact/build-related-data';

const AT = '2026-02-01T10:00:00.000Z';

describe('personLastContact', () => {
  it('should return undefined when the aggregate has no contact item', () => {
    expect(personLastContact({ lastContactAt: AT })).toBeUndefined();
    expect(
      personLastContact({ item: { kind: 'email', id: 'message-1' } }),
    ).toBeUndefined();
  });

  it('should return the date and item when both are present', () => {
    expect(
      personLastContact({
        lastContactAt: AT,
        item: { kind: 'email', id: 'message-1' },
      }),
    ).toEqual({ at: AT, item: { kind: 'email', id: 'message-1' } });
  });
});

describe('buildRelatedData', () => {
  it('should point at the message for an email contact', () => {
    expect(
      buildRelatedData({ at: AT, item: { kind: 'email', id: 'message-1' } }),
    ).toEqual({
      lastContactAt: AT,
      lastContactItemMessageId: 'message-1',
      lastContactItemCalendarEventId: null,
    });
  });

  it('should point at the calendar event for a meeting contact', () => {
    expect(
      buildRelatedData({ at: AT, item: { kind: 'meeting', id: 'event-1' } }),
    ).toEqual({
      lastContactAt: AT,
      lastContactItemMessageId: null,
      lastContactItemCalendarEventId: 'event-1',
    });
  });

  it('should clear every field when there is no contact', () => {
    expect(buildRelatedData(undefined)).toEqual({
      lastContactAt: null,
      lastContactItemMessageId: null,
      lastContactItemCalendarEventId: null,
    });
  });
});
