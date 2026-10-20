import * as jwt from 'jsonwebtoken';

import { parseTokenResponse } from 'src/engine/core-modules/application/connection-provider/utils/parse-token-response.util';

describe('parseTokenResponse', () => {
  it('parses numeric expires_in correctly', () => {
    const result = parseTokenResponse({
      access_token: 'test_access_token',
      refresh_token: 'test_refresh_token',
      expires_in: 300,
      scope: 'read write',
    });

    expect(result).toEqual({
      accessToken: 'test_access_token',
      refreshToken: 'test_refresh_token',
      idToken: null,
      scopes: ['read', 'write'],
      expiresIn: 300,
    });
  });

  it('parses string numeric expires_in correctly', () => {
    const result = parseTokenResponse({
      access_token: 'test_access_token',
      expires_in: '600',
    });

    expect(result.expiresIn).toBe(600);
  });

  it('returns expiresIn as null when expires_in is absent and access token is opaque', () => {
    const result = parseTokenResponse({
      access_token: 'opaque_token_without_exp',
    });

    expect(result.expiresIn).toBeNull();
  });

  it('extracts expiresIn from JWT exp claim when expires_in is omitted', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 1200;
    const token = jwt.sign({ exp: futureExp, sub: 'user_1' }, 'secret');

    const result = parseTokenResponse({
      access_token: token,
    });

    expect(result.expiresIn).toBeGreaterThanOrEqual(1198);
    expect(result.expiresIn).toBeLessThanOrEqual(1202);
  });

  it('prefers explicit expires_in over JWT exp claim', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    const token = jwt.sign({ exp: futureExp }, 'secret');

    const result = parseTokenResponse({
      access_token: token,
      expires_in: 300,
    });

    expect(result.expiresIn).toBe(300);
  });

  it('falls back to JWT exp when expires_in is an empty or whitespace string', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 1200;
    const token = jwt.sign({ exp: futureExp }, 'secret');

    const resultWithEmptyString = parseTokenResponse({
      access_token: token,
      expires_in: '',
    });

    expect(resultWithEmptyString.expiresIn).toBeGreaterThanOrEqual(1198);

    const resultWithWhitespace = parseTokenResponse({
      access_token: token,
      expires_in: '   ',
    });

    expect(resultWithWhitespace.expiresIn).toBeGreaterThanOrEqual(1198);
  });

  it('falls back to JWT exp when expires_in is 0 or negative', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 1200;
    const token = jwt.sign({ exp: futureExp }, 'secret');

    const result = parseTokenResponse({
      access_token: token,
      expires_in: 0,
    });

    expect(result.expiresIn).toBeGreaterThanOrEqual(1198);
  });

  it('clamps non-positive expires_in to 0 when token is opaque', () => {
    const resultZero = parseTokenResponse({
      access_token: 'opaque_token',
      expires_in: 0,
    });

    expect(resultZero.expiresIn).toBe(0);

    const resultNegative = parseTokenResponse({
      access_token: 'opaque_token',
      expires_in: -30,
    });

    expect(resultNegative.expiresIn).toBe(0);
  });

  it('ignores non-numeric expires_in string and falls back to null', () => {
    const result = parseTokenResponse({
      access_token: 'opaque_token',
      expires_in: 'invalid_duration',
    });

    expect(result.expiresIn).toBeNull();
  });

  it('throws an error when access_token is missing from response', () => {
    expect(() =>
      parseTokenResponse({
        refresh_token: 'only_refresh',
      }),
    ).toThrow(/did not return an access_token/);
  });
});
