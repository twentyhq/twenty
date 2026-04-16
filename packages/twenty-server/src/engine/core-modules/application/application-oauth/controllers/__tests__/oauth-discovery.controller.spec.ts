import { PATH_METADATA } from '@nestjs/common/constants';
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

  describe('getProtectedResourceMetadata', () => {
    it('echoes the request host in the resource and authorization_servers', () => {
      const request = buildMockRequest('workspace.twenty.com');

      expect(controller.getProtectedResourceMetadata(request)).toEqual({
        resource: 'https://workspace.twenty.com/mcp',
        authorization_servers: ['https://workspace.twenty.com'],
        scopes_supported: ['api', 'profile'],
        bearer_methods_supported: ['header'],
      });
    });

    // RFC 9728 defines both a root and a resource-specific well-known
    // URL; both must resolve to this handler so any conformant client
    // can discover the metadata.
    it('is registered at both the root and the /mcp path-aware URL', () => {
      const paths = Reflect.getMetadata(
        PATH_METADATA,
        controller.getProtectedResourceMetadata,
      );

      expect(paths).toEqual([
        'oauth-protected-resource',
        'oauth-protected-resource/mcp',
      ]);
    });
  });
});
