import { type Request } from 'express';

import { extractUserSessionTokenFromRequestCookie } from 'src/engine/core-modules/user-session/utils/extract-user-session-token-from-request.util';

const buildRequest = (cookieHeader?: string): Request =>
  ({
    headers: cookieHeader === undefined ? {} : { cookie: cookieHeader },
  }) as Request;

describe('extractUserSessionTokenFromRequestCookie', () => {
  it('should return undefined without a cookie header', () => {
    expect(extractUserSessionTokenFromRequestCookie(buildRequest())).toBe(
      undefined,
    );
  });

  it('should read the plain cookie name', () => {
    expect(
      extractUserSessionTokenFromRequestCookie(
        buildRequest('foo=bar; twenty-session=sess_abc; other=1'),
      ),
    ).toBe('sess_abc');
  });

  it('should prefer the __Host- cookie name', () => {
    expect(
      extractUserSessionTokenFromRequestCookie(
        buildRequest('twenty-session=sess_old; __Host-twenty-session=sess_new'),
      ),
    ).toBe('sess_new');
  });

  it('should ignore values without the session token prefix', () => {
    expect(
      extractUserSessionTokenFromRequestCookie(
        buildRequest('twenty-session=not-a-session-token'),
      ),
    ).toBe(undefined);
  });

  it('should ignore lookalike cookie names', () => {
    expect(
      extractUserSessionTokenFromRequestCookie(
        buildRequest('not-twenty-session=sess_abc'),
      ),
    ).toBe(undefined);
  });
});
