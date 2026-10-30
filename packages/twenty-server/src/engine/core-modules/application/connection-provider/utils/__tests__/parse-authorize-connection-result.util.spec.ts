import { parseAuthorizeConnectionResult } from 'src/engine/core-modules/application/connection-provider/utils/parse-authorize-connection-result.util';

describe('parseAuthorizeConnectionResult', () => {
  it('returns the trimmed authorization URL', () => {
    expect(
      parseAuthorizeConnectionResult({
        authorizationUrl: ' https://account.example.com/connect?link=abc ',
      }),
    ).toEqual({
      isValid: true,
      authorizationUrl: 'https://account.example.com/connect?link=abc',
    });
  });

  it.each([
    ['a missing result', undefined],
    ['a null result', null],
    ['a missing URL', {}],
    ['a relative URL', { authorizationUrl: '/connect' }],
    ['a non-http URL', { authorizationUrl: 'javascript:alert(1)' }],
  ])('rejects %s', (_label, data) => {
    expect(parseAuthorizeConnectionResult(data)).toEqual({
      isValid: false,
      reason: expect.any(String),
    });
  });
});
