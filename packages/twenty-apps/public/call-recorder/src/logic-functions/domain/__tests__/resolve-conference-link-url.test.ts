import { describe, expect, it } from 'vitest';

import { resolveConferenceLinkUrl } from 'src/logic-functions/domain/resolve-conference-link-url.util';

describe('resolveConferenceLinkUrl', () => {
  it('returns the structured conference link when present', () => {
    expect(
      resolveConferenceLinkUrl({
        conferenceLinkUrl: 'https://meet.google.com/abc-defg-hij',
        location: 'https://zoom.us/j/81234567890',
        description: 'Join Zoom Meeting https://zoom.us/j/99999999999',
      }),
    ).toBe('https://meet.google.com/abc-defg-hij');
  });

  it('parses the location when the structured link is empty', () => {
    expect(
      resolveConferenceLinkUrl({
        conferenceLinkUrl: undefined,
        location: 'https://zoom.us/j/81234567890',
        description: 'Weekly sync',
      }),
    ).toBe('https://zoom.us/j/81234567890');
  });

  it('parses the description when the structured link and location have none', () => {
    expect(
      resolveConferenceLinkUrl({
        conferenceLinkUrl: '',
        location: 'Conference Room A',
        description:
          'Felix is inviting you to a scheduled Zoom meeting.\nJoin Zoom Meeting\nhttps://us02web.zoom.us/j/81234567890?pwd=aBcDeF123',
      }),
    ).toBe('https://us02web.zoom.us/j/81234567890?pwd=aBcDeF123');
  });

  it('prefers the location link over the description link', () => {
    expect(
      resolveConferenceLinkUrl({
        conferenceLinkUrl: null,
        location: 'https://zoom.us/j/11111111111',
        description: 'Join Zoom Meeting https://zoom.us/j/22222222222',
      }),
    ).toBe('https://zoom.us/j/11111111111');
  });

  it('returns undefined when no conference link exists anywhere', () => {
    expect(
      resolveConferenceLinkUrl({
        conferenceLinkUrl: undefined,
        location: 'Conference Room A',
        description: 'Quarterly review agenda',
      }),
    ).toBeUndefined();
  });
});
