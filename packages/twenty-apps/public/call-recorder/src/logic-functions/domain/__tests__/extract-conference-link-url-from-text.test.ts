import { describe, expect, it } from 'vitest';

import { extractConferenceLinkUrlFromText } from 'src/logic-functions/domain/extract-conference-link-url-from-text.util';

describe('extractConferenceLinkUrlFromText', () => {
  it.each([
    [
      'extracts a Zoom link from a plain text invitation',
      'Felix is inviting you to a scheduled Zoom meeting.\n\nJoin Zoom Meeting\nhttps://us02web.zoom.us/j/81234567890?pwd=aBcDeF123\n\nMeeting ID: 812 3456 7890',
      'https://us02web.zoom.us/j/81234567890?pwd=aBcDeF123',
    ],
    [
      'extracts a bare Zoom link (location field)',
      'https://zoom.us/j/81234567890',
      'https://zoom.us/j/81234567890',
    ],
    [
      'extracts a Zoom personal room link',
      'Join me at https://company.zoom.us/my/felix today',
      'https://company.zoom.us/my/felix',
    ],
    [
      'extracts a Zoom Government link',
      'Join: https://example.zoomgov.com/j/1609618851',
      'https://example.zoomgov.com/j/1609618851',
    ],
    [
      'extracts a Zoom link from an HTML body and decodes &amp;',
      '<div><a href="https://us02web.zoom.us/j/81234567890?pwd=aBcDeF123&amp;uname=Felix">Join Zoom Meeting</a></div>',
      'https://us02web.zoom.us/j/81234567890?pwd=aBcDeF123&uname=Felix',
    ],
    [
      'strips trailing sentence punctuation',
      'Join here: https://zoom.us/j/81234567890.',
      'https://zoom.us/j/81234567890',
    ],
    [
      'extracts a Google Meet link',
      'Join the call on https://meet.google.com/abc-defg-hij',
      'https://meet.google.com/abc-defg-hij',
    ],
    [
      'extracts a Microsoft Teams link',
      'Click here to join: https://teams.microsoft.com/l/meetup-join/19%3ameeting_ABC123%40thread.v2/0?context=%7b%22Tid%22%3a%22111%22%7d',
      'https://teams.microsoft.com/l/meetup-join/19%3ameeting_ABC123%40thread.v2/0?context=%7b%22Tid%22%3a%22111%22%7d',
    ],
    [
      'extracts a Webex link',
      'Join at https://company.webex.com/company/j.php?MTID=m1234abcd',
      'https://company.webex.com/company/j.php?MTID=m1234abcd',
    ],
    [
      'extracts a GoTo Meeting link',
      'https://global.gotomeeting.com/join/123456789',
      'https://global.gotomeeting.com/join/123456789',
    ],
    [
      'prefers a Zoom link over a Google Meet link when both are present',
      'Video call: https://meet.google.com/abc-defg-hij\nJoin Zoom Meeting\nhttps://zoom.us/j/81234567890',
      'https://zoom.us/j/81234567890',
    ],
  ])('%s', (_label, text, expectedUrl) => {
    expect(extractConferenceLinkUrlFromText(text)).toBe(expectedUrl);
  });

  it.each([
    [
      'a non-conferencing URL',
      'Agenda: https://docs.google.com/document/d/abc',
    ],
    ['a Zoom marketing page URL', 'Learn more at https://zoom.us/pricing'],
    ['plain text without links', 'Conference Room A'],
    ['an empty string', ''],
    ['a blank string', '   '],
  ])('returns undefined for %s', (_label, text) => {
    expect(extractConferenceLinkUrlFromText(text)).toBeUndefined();
  });

  it('returns undefined for null and undefined', () => {
    expect(extractConferenceLinkUrlFromText(null)).toBeUndefined();
    expect(extractConferenceLinkUrlFromText(undefined)).toBeUndefined();
  });
});
