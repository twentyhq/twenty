import { describe, expect, it } from 'vitest';

import { splitCallbackUrlState } from 'src/unipile/utils/split-callback-url-state.util';

describe('splitCallbackUrlState', () => {
  it('moves the state out of the callback URL', () => {
    expect(
      splitCallbackUrlState(
        'https://api.twenty.com/auth/apps/custom/callback?state=signed.state',
      ),
    ).toEqual({
      redirectUri: 'https://api.twenty.com/auth/apps/custom/callback',
      state: 'signed.state',
    });
  });

  it('throws when the callback URL carries no state', () => {
    expect(() =>
      splitCallbackUrlState('https://api.twenty.com/auth/apps/custom/callback'),
    ).toThrow('Connection callback URL has no state');
  });
});
