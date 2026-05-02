import { deriveConnectionNameFromHandle } from 'src/engine/core-modules/application/application-oauth-provider/utils/derive-connection-name-from-handle.util';

const buildJwt = (payload: Record<string, unknown>): string => {
  const header = Buffer.from(
    JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
  ).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');

  return `${header}.${body}.signature`;
};

describe('deriveConnectionNameFromHandle', () => {
  it('returns the email claim when the access token is a JWT carrying one', () => {
    const result = deriveConnectionNameFromHandle({
      providerDisplayName: 'Linear',
      accessToken: buildJwt({ email: 'octocat@example.com' }),
      fallbackIndex: 1,
    });

    expect(result).toBe('octocat@example.com');
  });

  it('prefers email over login when both are present', () => {
    const result = deriveConnectionNameFromHandle({
      providerDisplayName: 'Linear',
      accessToken: buildJwt({
        login: 'octocat',
        email: 'octocat@example.com',
      }),
      fallbackIndex: 1,
    });

    expect(result).toBe('octocat@example.com');
  });

  it('falls back to "{Provider} #N" when the token is opaque', () => {
    const result = deriveConnectionNameFromHandle({
      providerDisplayName: 'Linear',
      accessToken: 'lin_opaque_access_token',
      fallbackIndex: 3,
    });

    expect(result).toBe('Linear #3');
  });

  it('falls back to "{Provider} #N" when the JWT has none of the expected claims', () => {
    const result = deriveConnectionNameFromHandle({
      providerDisplayName: 'Linear',
      accessToken: buildJwt({ scope: 'read write' }),
      fallbackIndex: 2,
    });

    expect(result).toBe('Linear #2');
  });

  it('falls back to "{Provider} #N" when JWT body is malformed', () => {
    const result = deriveConnectionNameFromHandle({
      providerDisplayName: 'Linear',
      accessToken: 'header.notbase64.signature',
      fallbackIndex: 5,
    });

    expect(result).toBe('Linear #5');
  });
});
