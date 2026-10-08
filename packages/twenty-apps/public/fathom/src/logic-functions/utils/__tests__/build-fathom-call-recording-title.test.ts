import { describe, expect, it } from 'vitest';

import { buildFathomCallRecordingTitle } from 'src/logic-functions/utils/build-fathom-call-recording-title.util';

const MEETING = {
  recordingStartTime: new Date('2026-09-17T20:00:00+05:30'),
  meetingTitle: 'Impromptu Zoom Meeting',
  title: 'Impromptu Zoom Meeting',
};

describe('buildFathomCallRecordingTitle', () => {
  it.each([
    'Impromptu',
    'Impromptu meeting',
    'Impromptu Zoom Meeting',
    'Impromptu Google Meet Meeting',
    'Impromptu Microsoft Teams Meeting',
    'Impromptu Slack Huddle',
    'impromptu zoom call',
  ])('immediately distinguishes %s with its recording time in UTC', (title) => {
    expect(
      buildFathomCallRecordingTitle({ ...MEETING, title, meetingTitle: title }),
    ).toEqual({
      title: `${title} (17 Sept 2026, 14:30 UTC)`,
      impromptuTitle: title,
    });
  });

  it.each(['Acme onboarding review', 'Impromptu product strategy review'])(
    'keeps the meaningful title %s ineligible for generation',
    (meetingTitle) => {
      expect(
        buildFathomCallRecordingTitle({ ...MEETING, meetingTitle }),
      ).toEqual({
        title: meetingTitle,
      });
    },
  );

  it('keeps a renamed Fathom recording when the calendar title is generic', () => {
    expect(
      buildFathomCallRecordingTitle({
        ...MEETING,
        title: 'Acme onboarding review',
      }),
    ).toEqual({ title: 'Acme onboarding review' });
  });

  it('uses the recording title when there is no calendar title', () => {
    expect(
      buildFathomCallRecordingTitle({
        ...MEETING,
        meetingTitle: null,
        title: '  Impromptu Zoom Meeting  ',
      }),
    ).toEqual({
      title: 'Impromptu Zoom Meeting (17 Sept 2026, 14:30 UTC)',
      impromptuTitle: 'Impromptu Zoom Meeting',
    });
  });
});
