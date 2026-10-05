import { DomainServerConfigService } from 'src/engine/core-modules/domain/domain-server-config/services/domain-server-config.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const buildService = (config: Record<string, string | boolean>) =>
  new DomainServerConfigService({
    get: (key: string) => config[key],
  } as unknown as TwentyConfigService);

describe('DomainServerConfigService', () => {
  describe('getSubdomainAndDomainFromUrl', () => {
    const service = buildService({
      SERVER_URL: 'https://twenty.example.com',
      PUBLIC_DOMAIN_URL: 'https://example.com',
      DEFAULT_SUBDOMAIN: 'app',
    });

    it('should not treat the front host as a public domain origin when it sits under the public domain', () => {
      expect(
        service.getSubdomainAndDomainFromUrl('https://twenty.example.com'),
      ).toEqual({
        subdomain: undefined,
        domain: null,
        isPublicDomainOrigin: false,
      });
    });

    it('should resolve workspace subdomains of the front host', () => {
      expect(
        service.getSubdomainAndDomainFromUrl('https://acme.twenty.example.com'),
      ).toEqual({
        subdomain: 'acme',
        domain: null,
        isPublicDomainOrigin: false,
      });
    });

    it('should keep other hosts under the public domain as public domain origins', () => {
      expect(
        service.getSubdomainAndDomainFromUrl('https://my-app.example.com'),
      ).toEqual({
        subdomain: 'my-app',
        domain: null,
        isPublicDomainOrigin: true,
      });
    });
  });
});
