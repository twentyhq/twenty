import { Test, type TestingModule } from '@nestjs/testing';

import { type Request } from 'express';

import { OAuthDiscoveryController } from 'src/engine/core-modules/application/application-oauth/controllers/oauth-discovery.controller';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { DomainServerConfigService } from 'src/engine/core-modules/domain/domain-server-config/services/domain-server-config.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

describe('OAuthDiscoveryController', () => {
  let controller: OAuthDiscoveryController;

  const buildMockRequest = (host: string, protocol = 'https') =>
    ({
      protocol,
      get: (header: string) =>
        header.toLowerCase() === 'host' ? host : undefined,
    }) as unknown as Request;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OAuthDiscoveryController],
      providers: [
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('https://api.example.com'),
          },
        },
        {
          provide: DomainServerConfigService,
          useValue: {
            getBaseUrl: jest
              .fn()
              .mockReturnValue(new URL('https://app.example.com')),
          },
        },
        {
          provide: ApplicationRegistrationService,
          useValue: { findOneByUniversalIdentifierGlobal: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get(OAuthDiscoveryController);
  });

  // RFC 9728 §3.2 requires the `resource` value to match the identifier into
  // which the well-known path suffix was inserted — so the root maps to the
  // origin itself and the /mcp variant maps to <origin>/mcp.
  describe('getProtectedResourceMetadata', () => {
    it('root form returns the origin as the resource', () => {
      const request = buildMockRequest('workspace.twenty.com');

      expect(
        controller.getProtectedResourceMetadataRoot(request),
      ).toMatchObject({
        resource: 'https://workspace.twenty.com',
        authorization_servers: ['https://workspace.twenty.com'],
      });
    });

    it('path-aware /mcp form returns origin/mcp as the resource', () => {
      const request = buildMockRequest('workspace.twenty.com');

      expect(controller.getProtectedResourceMetadataMcp(request)).toMatchObject(
        {
          resource: 'https://workspace.twenty.com/mcp',
          authorization_servers: ['https://workspace.twenty.com'],
        },
      );
    });
  });

  describe('getAuthorizationServerMetadata', () => {
    it('leaves the endpoint untouched when the api host serves /authorize itself', async () => {
      const singleDomainModule = await Test.createTestingModule({
        controllers: [OAuthDiscoveryController],
        providers: [
          {
            provide: TwentyConfigService,
            useValue: {
              get: jest.fn().mockReturnValue('https://crm.acme.com'),
            },
          },
          {
            provide: DomainServerConfigService,
            useValue: {
              getBaseUrl: jest
                .fn()
                .mockReturnValue(new URL('https://crm.acme.com')),
            },
          },
          {
            provide: ApplicationRegistrationService,
            useValue: { findOneByUniversalIdentifierGlobal: jest.fn() },
          },
        ],
      }).compile();

      const metadata = await singleDomainModule
        .get(OAuthDiscoveryController)
        .getAuthorizationServerMetadata(buildMockRequest('crm.acme.com'));

      expect(metadata).toMatchObject({
        issuer: 'https://crm.acme.com',
        authorization_endpoint: 'https://crm.acme.com/authorize',
        authorization_response_iss_parameter_supported: true,
      });
    });

    it('serves /authorize on its own origin when it has one', async () => {
      const request = buildMockRequest('workspace.twenty.com');

      expect(
        await controller.getAuthorizationServerMetadata(request),
      ).toMatchObject({
        issuer: 'https://workspace.twenty.com',
        authorization_endpoint: 'https://workspace.twenty.com/authorize',
        authorization_response_iss_parameter_supported: true,
      });
    });

    it('forwards its issuer to the frontend origin it delegates to', async () => {
      const request = buildMockRequest('api.example.com');

      expect(
        await controller.getAuthorizationServerMetadata(request),
      ).toMatchObject({
        issuer: 'https://api.example.com',
        authorization_endpoint:
          'https://app.example.com/authorize?iss=https%3A%2F%2Fapi.example.com',
        authorization_response_iss_parameter_supported: true,
      });
    });
  });
});
