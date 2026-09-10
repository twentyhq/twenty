import * as http from 'http';
import * as https from 'https';

import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

describe('SecureHttpClientService', () => {
  const buildService = (config: {
    OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS: string[];
    OUTBOUND_HTTP_SAFE_MODE_ENABLED?: boolean;
  }) =>
    new SecureHttpClientService({
      get: (key: keyof typeof config) => config[key],
    } as unknown as TwentyConfigService);

  describe('getSsrfSafeAgent', () => {
    it('returns an agent matching the URL protocol', () => {
      const service = buildService({
        OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS: [],
      });

      expect(
        service.getSsrfSafeAgent(new URL('https://idp.example.com')),
      ).toBeInstanceOf(https.Agent);
      expect(
        service.getSsrfSafeAgent(new URL('http://idp.example.com')),
      ).toBeInstanceOf(http.Agent);
    });

    it('returns an agent that blocks a private address', () => {
      const service = buildService({
        OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS: [],
      });

      const agent = service.getSsrfSafeAgent(
        new URL('http://169.254.169.254/latest/meta-data/'),
      ) as http.Agent;

      expect(() =>
        agent.createConnection(
          { host: '169.254.169.254' } as http.ClientRequestArgs,
          jest.fn(),
        ),
      ).toThrow(
        'Request to internal IP address 169.254.169.254 is not allowed.',
      );
    });

    it('returns undefined when all internal hosts are allowed', () => {
      const service = buildService({
        OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS: ['*'],
      });

      expect(
        service.getSsrfSafeAgent(new URL('http://keycloak:8080')),
      ).toBeUndefined();
    });

    it('honours the deprecated OUTBOUND_HTTP_SAFE_MODE_ENABLED=false', () => {
      const service = buildService({
        OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS: [],
        OUTBOUND_HTTP_SAFE_MODE_ENABLED: false,
      });

      expect(
        service.getSsrfSafeAgent(new URL('http://keycloak:8080')),
      ).toBeUndefined();
    });
  });

  describe('getValidatedHost', () => {
    it('returns an allowed internal host unchanged, ignoring case and whitespace', async () => {
      const service = buildService({
        OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS: [' Mail.Internal '],
      });

      await expect(service.getValidatedHost('mail.internal')).resolves.toBe(
        'mail.internal',
      );
    });
  });
});
