import * as jwt from 'jsonwebtoken';

import { parseTokenResponse } from 'src/engine/core-modules/application/connection-provider/utils/parse-token-response.util';

describe('parseTokenResponse', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('computes expiresAt from numeric expires_in', () => {
    const result = parseTokenResponse({
      access_token: 'valid-access-token',
      refresh_token: 'valid-refresh-token',
      expires_in: 300,
      scope: 'read write',
    });

    expect(result.accessToken).toBe('valid-access-token');
    expect(result.refreshToken).toBe('valid-refresh-token');
    expect(result.scopes).toEqual(['read', 'write']);
    expect(result.expiresAt).toEqual(new Date('2026-01-01T00:05:00.000Z'));
  });

  it('computes expiresAt from string expires_in', () => {
    const result = parseTokenResponse({
      access_token: 'valid-access-token',
      expires_in: '3600',
    });

    expect(result.expiresAt).toEqual(new Date('2026-01-01T01:00:00.000Z'));
  });

  it('extracts expiresAt from JWT exp claim when expires_in is omitted', () => {
    const expSeconds = Math.floor(
      new Date('2026-01-01T00:15:00.000Z').getTime() / 1000,
    );
    const token = jwt.sign({ exp: expSeconds }, 'secret');

    const result = parseTokenResponse({
      access_token: token,
    });

    expect(result.expiresAt).toEqual(new Date('2026-01-01T00:15:00.000Z'));
  });

  it('leaves expiresAt as null when neither expires_in nor JWT exp claim is present', () => {
    const result = parseTokenResponse({
      access_token: 'opaque-token-without-expiry',
    });

    expect(result.expiresAt).toBeNull();
  });

  it('throws when access_token is missing', () => {
    expect(() =>
      parseTokenResponse({
        refresh_token: 'only-refresh',
      }),
    ).toThrow('Token endpoint did not return an access_token');
  });
});
