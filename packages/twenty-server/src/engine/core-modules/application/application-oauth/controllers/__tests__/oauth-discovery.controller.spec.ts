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
          useValue: { findOneByUniversalIdentifier: jest.fn() },
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
});
