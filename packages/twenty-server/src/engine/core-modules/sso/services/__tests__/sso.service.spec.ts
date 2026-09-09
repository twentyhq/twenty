/* @license Enterprise */

import * as http from 'http';
import * as https from 'https';

import { custom, Issuer } from 'openid-client';

import { type BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { type ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { SsoService } from 'src/engine/core-modules/sso/services/sso.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

describe('SsoService', () => {
  let mockTwentyConfigService: jest.Mocked<Pick<TwentyConfigService, 'get'>>;

  const buildSsoService = () => {
    mockTwentyConfigService = { get: jest.fn() };

    return new SsoService(
      {} as any,
      mockTwentyConfigService as unknown as TwentyConfigService,
      {} as BillingService,
      {} as ExceptionHandlerService,
    );
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Issuer.discover() SSRF protection', () => {
    it('routes discovery requests through an SSRF-safe https agent when safe mode is enabled', () => {
      buildSsoService();
      mockTwentyConfigService.get.mockReturnValue(true);

      const httpOptions = Issuer[custom.http_options](
        new URL('https://attacker-controlled-idp.example'),
        {} as any,
      );

      expect(mockTwentyConfigService.get).toHaveBeenCalledWith(
        'OUTBOUND_HTTP_SAFE_MODE_ENABLED',
      );
      expect(httpOptions.agent).toBeInstanceOf(https.Agent);
    });

    it('routes discovery requests through an SSRF-safe http agent when safe mode is enabled', () => {
      buildSsoService();
      mockTwentyConfigService.get.mockReturnValue(true);

      const httpOptions = Issuer[custom.http_options](
        new URL('http://169.254.169.254/latest/meta-data/'),
        {} as any,
      );

      expect(httpOptions.agent).toBeInstanceOf(http.Agent);
      expect(httpOptions.agent).not.toBeInstanceOf(https.Agent);
    });

    it('blocks a private/metadata address via the returned agent', () => {
      buildSsoService();
      mockTwentyConfigService.get.mockReturnValue(true);

      const httpOptions = Issuer[custom.http_options](
        new URL('http://169.254.169.254/latest/meta-data/'),
        {} as any,
      );

      const agent = httpOptions.agent as http.Agent;

      expect(() => {
        agent.createConnection(
          { host: '169.254.169.254' } as any,
          jest.fn() as any,
        );
      }).toThrow(
        'Request to internal IP address 169.254.169.254 is not allowed.',
      );
    });

    it('does not override the agent when safe mode is disabled', () => {
      buildSsoService();
      mockTwentyConfigService.get.mockReturnValue(false);

      const httpOptions = Issuer[custom.http_options](
        new URL('https://issuer.example.com'),
        {} as any,
      );

      expect(httpOptions).toStrictEqual({});
    });
  });
});
