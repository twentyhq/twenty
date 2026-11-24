import { describe, expect, it } from 'vitest';

import { narrowMemberRecordingPreferenceToCalendarEvent } from 'src/logic-functions/domain/narrow-member-recording-preference-to-calendar-event.util';
import { type MemberRecordingPreference } from 'src/logic-functions/types/member-recording-preference.type';

describe('narrowMemberRecordingPreferenceToCalendarEvent', () => {
  it.each<[MemberRecordingPreference, boolean, 'ALL' | 'NONE']>([
    ['ALL', true, 'ALL'],
    ['ALL', false, 'ALL'],
    ['NONE', true, 'NONE'],
    ['NONE', false, 'NONE'],
    ['INTERNAL', true, 'ALL'],
    ['INTERNAL', false, 'NONE'],
    ['EXTERNAL', true, 'NONE'],
    ['EXTERNAL', false, 'ALL'],
  ])(
    'narrows %s on a meeting that is internal: %s to %s',
    (memberRecordingPreference, isCalendarEventInternal, expected) => {
      expect(
        narrowMemberRecordingPreferenceToCalendarEvent({
          memberRecordingPreference,
          isCalendarEventInternal,
        }),
      ).toBe(expected);
    },
  );
});
