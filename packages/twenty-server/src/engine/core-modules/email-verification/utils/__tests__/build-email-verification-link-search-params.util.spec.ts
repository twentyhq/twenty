import { buildEmailVerificationLinkSearchParams } from 'src/engine/core-modules/email-verification/utils/build-email-verification-link-search-params.util';

describe('buildEmailVerificationLinkSearchParams', () => {
  it('should carry the partner as the via param', () => {
    expect(
      buildEmailVerificationLinkSearchParams({
        emailVerificationToken: 'token',
        email: 'tim@apple.dev',
        affiliatePartnerName: 'northwind',
      }),
    ).toEqual({
      emailVerificationToken: 'token',
      email: 'tim@apple.dev',
      via: 'northwind',
    });
  });

  it('should keep the redirect path as nextPath', () => {
    expect(
      buildEmailVerificationLinkSearchParams({
        emailVerificationToken: 'token',
        email: 'tim@apple.dev',
        verifyEmailRedirectPath: '/plan-required',
      }),
    ).toEqual({
      emailVerificationToken: 'token',
      email: 'tim@apple.dev',
      nextPath: '/plan-required',
    });
  });

  it('should leave out an empty partner', () => {
    expect(
      buildEmailVerificationLinkSearchParams({
        emailVerificationToken: 'token',
        email: 'tim@apple.dev',
        affiliatePartnerName: '',
      }),
    ).toEqual({ emailVerificationToken: 'token', email: 'tim@apple.dev' });
  });
});
