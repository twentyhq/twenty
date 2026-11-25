import { describe, expect, it } from 'vitest';

import { normalizeMeetingUrl } from 'src/logic-functions/utils/normalize-meeting-url.util';

describe('normalizeMeetingUrl', () => {
  it('should ignore the query, fragment, trailing slash and host casing', () => {
    expect(
      normalizeMeetingUrl('https://Meet.Google.com/abc-mnop-xyz/?authuser=1#x'),
    ).toBe('https://meet.google.com/abc-mnop-xyz');
  });

  it.each([null, undefined, '', 'abc-mnop-xyz'])(
    'should give no URL for %j',
    (meetingUrl) => {
      expect(normalizeMeetingUrl(meetingUrl)).toBeUndefined();
    },
  );
});
