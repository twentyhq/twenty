import { describe, expect, it } from 'vitest';

import { RESTRICTED_FIELD_PLACEHOLDER } from 'src/logic-functions/constants/restricted-field-placeholder';
import { resolveCallRecordingDisplayTitle } from 'src/front-components/utils/resolve-call-recording-display-title.util';

describe('resolveCallRecordingDisplayTitle', () => {
  it('uses the recording title', () => {
    expect(
      resolveCallRecordingDisplayTitle({
        title: '  Weekly sync  ',
        calendarEvent: { id: 'event', title: 'Calendar title' },
      }),
    ).toBe('Weekly sync');
  });

  it('falls back to the meeting title', () => {
    expect(
      resolveCallRecordingDisplayTitle({
        title: ' ',
        calendarEvent: { id: 'event', title: 'Calendar title' },
      }),
    ).toBe('Calendar title');
  });

  it('ignores a meeting title the viewer is not allowed to see', () => {
    expect(
      resolveCallRecordingDisplayTitle({
        title: null,
        calendarEvent: { id: 'event', title: RESTRICTED_FIELD_PLACEHOLDER },
      }),
    ).toBe('Untitled call');
  });

  it('uses a short fallback without any title', () => {
    expect(
      resolveCallRecordingDisplayTitle({ title: null, calendarEvent: null }),
    ).toBe('Untitled call');
  });

  it('ignores a recording title copied from a restricted meeting', () => {
    expect(
      resolveCallRecordingDisplayTitle({
        title: RESTRICTED_FIELD_PLACEHOLDER,
        calendarEvent: { id: 'event', title: 'Calendar title' },
      }),
    ).toBe('Calendar title');
  });
});
