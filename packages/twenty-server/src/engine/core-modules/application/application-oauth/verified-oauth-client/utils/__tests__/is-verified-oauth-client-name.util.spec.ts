import { isVerifiedOAuthClientName } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/utils/is-verified-oauth-client-name.util';

describe('isVerifiedOAuthClientName', () => {
  it.each(['Twenty CLI', '  twenty cli ', 'TWENTY CLI'])(
    'should match "%s"',
    (name) => {
      expect(isVerifiedOAuthClientName(name)).toBe(true);
    },
  );

  it.each(['Twenty CLI 2', 'My assistant', ''])(
    'should not match "%s"',
    (name) => {
      expect(isVerifiedOAuthClientName(name)).toBe(false);
    },
  );
});
