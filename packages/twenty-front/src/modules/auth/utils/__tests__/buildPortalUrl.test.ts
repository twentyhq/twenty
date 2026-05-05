import { buildPortalUrl } from '@/auth/utils/buildPortalUrl';

describe('buildPortalUrl', () => {
  it('rewrites <prefix>-<app>.<domain> to <prefix>.<domain>', () => {
    expect(buildPortalUrl('foss-twenty.local.moneta.dev', 'https:')).toBe(
      'https://foss.local.moneta.dev/',
    );
  });

  it('preserves the same scheme for http://', () => {
    expect(buildPortalUrl('foss-pm.local.moneta.dev', 'http:')).toBe(
      'http://foss.local.moneta.dev/',
    );
  });

  it('no-ops on `localhost` (no hyphen segment, no first-label rewrite)', () => {
    expect(buildPortalUrl('localhost', 'http:')).toBe('http://localhost/');
  });

  it('no-ops on hosts without a hyphen segment', () => {
    expect(buildPortalUrl('foo.example.com', 'https:')).toBe(
      'https://foo.example.com/',
    );
  });

  it('only rewrites the first label, leaves deeper subdomains alone', () => {
    expect(buildPortalUrl('foss-twenty.staging.moneta.dev', 'https:')).toBe(
      'https://foss.staging.moneta.dev/',
    );
  });

  it('preserves port when present', () => {
    expect(
      buildPortalUrl('foss-twenty.local.moneta.dev:8080', 'http:'),
    ).toBe('http://foss.local.moneta.dev:8080/');
  });
});
