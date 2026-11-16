import { isVerifiedOAuthClientName } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/utils/is-verified-oauth-client-name.util';

describe('isVerifiedOAuthClientName', () => {
  it.each([
    'Twenty CLI',
    '  twenty cli ',
    'TWENTY CLI',
    'Twenty  CLI',
    'Twenty\u00a0CLI',
    'Twen\u200bty CLI',
    '\uff34wenty CLI',
    'Claude',
    'claude code',
    'ChatGPT',
  ])('should match "%s"', (name) => {
    expect(isVerifiedOAuthClientName(name)).toBe(true);
  });

  it.each(['Twenty CLI 2', 'My assistant', ''])(
    'should not match "%s"',
    (name) => {
      expect(isVerifiedOAuthClientName(name)).toBe(false);
    },
  );
});
