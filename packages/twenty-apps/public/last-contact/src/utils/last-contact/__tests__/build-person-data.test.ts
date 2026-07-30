import { describe, expect, it } from 'vitest';

import { buildPersonData } from 'src/utils/last-contact/build-person-data';
import { type PersonAgg } from 'src/utils/last-contact/types';

const AT = '2026-02-01T10:00:00.000Z';

const FULL_AGG: PersonAgg = {
  lastContactAt: AT,
  lastContactById: 'member-1',
  item: { kind: 'email', id: 'message-1' },
  lastOutboundAt: AT,
  lastInboundAt: AT,
  lastEmail: { at: AT, id: 'message-1' },
  lastMeeting: { at: AT, id: 'event-1' },
};

describe('buildPersonData', () => {
  it('should omit every key for an empty aggregate in advance-only mode', () => {
    expect(buildPersonData({})).toEqual({});
  });

  it('should null every key for an empty aggregate in overwrite mode', () => {
    expect(buildPersonData({}, 'overwrite')).toEqual({
      lastContactAt: null,
      lastContactById: null,
      lastOutboundAt: null,
      lastInboundAt: null,
      lastEmailId: null,
      lastMeetingId: null,
      lastContactItemMessageId: null,
      lastContactItemCalendarEventId: null,
    });
  });

  it('should write the same values in both modes when everything is computed', () => {
    const expected = {
      lastContactAt: AT,
      lastContactById: 'member-1',
      lastOutboundAt: AT,
      lastInboundAt: AT,
      lastEmailId: 'message-1',
      lastMeetingId: 'event-1',
      lastContactItemMessageId: 'message-1',
      lastContactItemCalendarEventId: null,
    };

    expect(buildPersonData(FULL_AGG)).toEqual(expected);
    expect(buildPersonData(FULL_AGG, 'overwrite')).toEqual(expected);
  });

  it('should clear only the missing keys in overwrite mode', () => {
    const agg: PersonAgg = {
      lastContactAt: AT,
      lastContactById: null,
      item: { kind: 'meeting', id: 'event-1' },
      lastInboundAt: AT,
      lastMeeting: { at: AT, id: 'event-1' },
    };

    expect(buildPersonData(agg, 'overwrite')).toEqual({
      lastContactAt: AT,
      lastContactById: null,
      lastOutboundAt: null,
      lastInboundAt: AT,
      lastEmailId: null,
      lastMeetingId: 'event-1',
      lastContactItemCalendarEventId: 'event-1',
      lastContactItemMessageId: null,
    });
  });

  it('should leave existing values untouched in advance-only mode', () => {
    const agg: PersonAgg = {
      lastInboundAt: AT,
    };

    expect(buildPersonData(agg)).toEqual({ lastInboundAt: AT });
  });
});
