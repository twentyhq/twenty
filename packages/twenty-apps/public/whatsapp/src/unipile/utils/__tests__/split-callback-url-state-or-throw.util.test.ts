import { describe, expect, it } from 'vitest';

import { splitCallbackUrlStateOrThrow } from 'src/unipile/utils/split-callback-url-state-or-throw.util';

describe('splitCallbackUrlStateOrThrow', () => {
  it('moves the state out of the callback URL', () => {
    expect(
      splitCallbackUrlStateOrThrow(
        'https://api.twenty.com/auth/apps/custom/callback?state=signed.state',
      ),
    ).toEqual({
      redirectUri: 'https://api.twenty.com/auth/apps/custom/callback',
      state: 'signed.state',
    });
  });

  it('throws when the callback URL carries no state', () => {
    expect(() =>
      splitCallbackUrlStateOrThrow(
        'https://api.twenty.com/auth/apps/custom/callback',
      ),
    ).toThrow('Connection callback URL has no state');
  });
});
