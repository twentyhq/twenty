import {
  getHostnameFromUrlOrUndefined,
  isHostUnderPublicFunctionDomain,
} from 'src/engine/core-modules/domain/domain-server-config/utils/public-function-domain.util';

describe('getHostnameFromUrlOrUndefined', () => {
  it('returns the lowercased hostname of a valid url', () => {
    expect(getHostnameFromUrlOrUndefined('https://WithTwenty.com')).toBe(
      'withtwenty.com',
    );
  });

  it('ignores the path and port', () => {
    expect(
      getHostnameFromUrlOrUndefined('https://withtwenty.com:8080/ignored'),
    ).toBe('withtwenty.com');
  });

  it('returns undefined for empty/nullish input', () => {
    expect(getHostnameFromUrlOrUndefined(undefined)).toBeUndefined();
    expect(getHostnameFromUrlOrUndefined(null)).toBeUndefined();
    expect(getHostnameFromUrlOrUndefined('')).toBeUndefined();
  });

  it('returns undefined for a non-url string', () => {
    expect(getHostnameFromUrlOrUndefined('not a url')).toBeUndefined();
  });
});

describe('isHostUnderPublicFunctionDomain', () => {
  const publicDomainBaseHostname = 'withtwenty.com';

  it('matches a strict subdomain of the base', () => {
    expect(
      isHostUnderPublicFunctionDomain({
        host: 'acme.withtwenty.com',
        publicDomainBaseHostname,
      }),
    ).toBe(true);
  });

  it('matches deeper subdomains', () => {
    expect(
      isHostUnderPublicFunctionDomain({
        host: 'app.acme.withtwenty.com',
        publicDomainBaseHostname,
      }),
    ).toBe(true);
  });

  it('is case-insensitive and strips the port', () => {
    expect(
      isHostUnderPublicFunctionDomain({
        host: 'ACME.WithTwenty.com:443',
        publicDomainBaseHostname,
      }),
    ).toBe(true);
  });

  it('does not match the apex base itself', () => {
    expect(
      isHostUnderPublicFunctionDomain({
        host: 'withtwenty.com',
        publicDomainBaseHostname,
      }),
    ).toBe(false);
  });

  it('does not match the main app domain', () => {
    expect(
      isHostUnderPublicFunctionDomain({
        host: 'acme.twenty.com',
        publicDomainBaseHostname,
      }),
    ).toBe(false);
  });

  it('does not match a lookalike suffix', () => {
    expect(
      isHostUnderPublicFunctionDomain({
        host: 'evilwithtwenty.com',
        publicDomainBaseHostname,
      }),
    ).toBe(false);
  });

  it('returns false when no base is configured', () => {
    expect(
      isHostUnderPublicFunctionDomain({
        host: 'acme.withtwenty.com',
        publicDomainBaseHostname: undefined,
      }),
    ).toBe(false);
  });

  it('returns false when host is missing', () => {
    expect(
      isHostUnderPublicFunctionDomain({
        host: undefined,
        publicDomainBaseHostname,
      }),
    ).toBe(false);
  });
});
