import { getSubdomainAndDomainFromHostname } from 'src/engine/core-modules/domain/domain-server-config/utils/get-subdomain-and-domain-from-hostname.util';

describe('getSubdomainAndDomainFromHostname', () => {
  const config = {
    frontDomain: 'twenty.com',
    publicBaseDomain: 'withtwenty.com',
    defaultSubdomain: 'app',
  };

  it.each([
    {
      case: 'the front host',
      hostname: 'twenty.com',
      expected: {
        subdomain: undefined,
        domain: null,
        isPublicDomainOrigin: false,
      },
    },
    {
      case: 'a workspace subdomain',
      hostname: 'acme.twenty.com',
      expected: {
        subdomain: 'acme',
        domain: null,
        isPublicDomainOrigin: false,
      },
    },
    {
      case: 'the default subdomain',
      hostname: 'app.twenty.com',
      expected: {
        subdomain: undefined,
        domain: null,
        isPublicDomainOrigin: false,
      },
    },
    {
      case: 'a public domain host',
      hostname: 'acme.withtwenty.com',
      expected: { subdomain: 'acme', domain: null, isPublicDomainOrigin: true },
    },
    {
      case: 'a custom domain',
      hostname: 'crm.acme.com',
      expected: {
        subdomain: undefined,
        domain: 'crm.acme.com',
        isPublicDomainOrigin: false,
      },
    },
  ])('should resolve $case', ({ hostname, expected }) => {
    expect(getSubdomainAndDomainFromHostname({ ...config, hostname })).toEqual(
      expected,
    );
  });

  it('should resolve the front host as the front domain when it sits under the public domain', () => {
    expect(
      getSubdomainAndDomainFromHostname({
        hostname: 'twenty.example.com',
        frontDomain: 'twenty.example.com',
        publicBaseDomain: 'example.com',
        defaultSubdomain: 'app',
      }),
    ).toEqual({
      subdomain: undefined,
      domain: null,
      isPublicDomainOrigin: false,
    });
  });

  it('should resolve workspace subdomains of a front host under the public domain', () => {
    expect(
      getSubdomainAndDomainFromHostname({
        hostname: 'acme.twenty.example.com',
        frontDomain: 'twenty.example.com',
        publicBaseDomain: 'example.com',
        defaultSubdomain: 'app',
      }),
    ).toEqual({ subdomain: 'acme', domain: null, isPublicDomainOrigin: false });
  });

  it('should not treat hosts as public domains when no public domain is configured', () => {
    expect(
      getSubdomainAndDomainFromHostname({
        hostname: 'acme.withtwenty.com',
        frontDomain: 'twenty.com',
        defaultSubdomain: 'app',
      }),
    ).toEqual({
      subdomain: undefined,
      domain: 'acme.withtwenty.com',
      isPublicDomainOrigin: false,
    });
  });
});
