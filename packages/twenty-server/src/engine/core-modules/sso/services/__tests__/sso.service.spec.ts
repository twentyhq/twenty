/* @license Enterprise */

import * as http from 'http';

import { custom, Issuer } from 'openid-client';

import { type BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { type ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { SsoService } from 'src/engine/core-modules/sso/services/sso.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import {
  IdentityProviderType,
  type WorkspaceSsoIdentityProviderEntity,
} from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';

const METADATA_SERVICE_URL = new URL(
  'http://169.254.169.254/latest/meta-data/',
);

const expectAgentToBlockMetadataService = (options: {
  agent?: http.Agent | boolean;
}) => {
  expect(options.agent).toBeInstanceOf(http.Agent);
  expect(() =>
    (options.agent as http.Agent).createConnection(
      { host: METADATA_SERVICE_URL.hostname } as http.ClientRequestArgs,
      jest.fn(),
    ),
  ).toThrow('Request to internal IP address 169.254.169.254 is not allowed.');
};

describe('SsoService', () => {
  const originalIssuerHttpOptions = Issuer[custom.http_options];

  const buildSsoService = (allowedInternalHosts: string[] = []) => {
    const twentyConfigService = {
      get: (key: string) =>
        key === 'OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS'
          ? allowedInternalHosts
          : 'https://app.example.com',
    } as unknown as TwentyConfigService;

    return new SsoService(
      {} as never,
      twentyConfigService,
      {} as BillingService,
      {} as ExceptionHandlerService,
      new SecureHttpClientService(twentyConfigService),
    );
  };

  const oidcIdentityProvider = {
    type: IdentityProviderType.OIDC,
    id: 'idp-id',
    clientID: 'client-id',
    clientSecret: 'client-secret',
  } as WorkspaceSsoIdentityProviderEntity;

  afterEach(() => {
    Issuer[custom.http_options] = originalIssuerHttpOptions;
  });

  it('blocks issuer discovery against the metadata service', () => {
    buildSsoService();

    expectAgentToBlockMetadataService(
      Issuer[custom.http_options](METADATA_SERVICE_URL, {}),
    );
  });

  it('blocks JWKS, token and userinfo endpoints that a discovery document points at the metadata service', () => {
    const ssoService = buildSsoService();
    const issuer = new Issuer({ issuer: 'https://idp.example.com' });

    const client = ssoService.getOidcClient(oidcIdentityProvider, issuer);

    expectAgentToBlockMetadataService(
      issuer[custom.http_options](METADATA_SERVICE_URL, {}),
    );
    expectAgentToBlockMetadataService(
      client[custom.http_options](METADATA_SERVICE_URL, {}),
    );
  });

  it('does not restrict requests when every internal host is allowed', () => {
    buildSsoService(['*']);

    expect(Issuer[custom.http_options](METADATA_SERVICE_URL, {})).toEqual({
      agent: undefined,
    });
  });
});
