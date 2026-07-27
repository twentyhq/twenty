import { describe, expect, it } from 'vitest';

import { isSupportedMeetingPlatformUrl } from 'src/logic-functions/domain/is-supported-meeting-platform-url.util';

describe('isSupportedMeetingPlatformUrl', () => {
  it.each([
    ['a Zoom link', 'https://zoom.us/j/81234567890'],
    ['a Zoom subdomain link', 'https://us02web.zoom.us/j/81234567890?pwd=aBc'],
    ['a Google Meet link', 'https://meet.google.com/abc-defg-hij'],
    [
      'a Microsoft Teams link',
      'https://teams.microsoft.com/l/meetup-join/19%3ameeting_ABC%40thread.v2/0',
    ],
    ['a Webex link', 'https://company.webex.com/company/j.php?MTID=m1234abcd'],
    ['a GoTo Meeting link', 'https://global.gotomeeting.com/join/123456789'],
  ])('returns true for %s', (_label, url) => {
    expect(isSupportedMeetingPlatformUrl(url)).toBe(true);
  });

  it.each([
    ['a ro.am link', 'https://ro.am/r/#/d/123'],
    ['a Daily link', 'https://example.daily.co/room'],
    ['a Whereby link', 'https://whereby.com/team-room'],
    ['a Zoom marketing page', 'https://zoom.us/pricing'],
    ['a non-conferencing URL', 'https://docs.google.com/document/d/abc'],
    ['an empty string', ''],
    ['a blank string', '   '],
  ])('returns false for %s', (_label, url) => {
    expect(isSupportedMeetingPlatformUrl(url)).toBe(false);
  });

  it('returns false for null and undefined', () => {
    expect(isSupportedMeetingPlatformUrl(null)).toBe(false);
    expect(isSupportedMeetingPlatformUrl(undefined)).toBe(false);
  });
});
