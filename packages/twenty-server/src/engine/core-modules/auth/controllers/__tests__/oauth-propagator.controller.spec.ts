import { Test, type TestingModule } from '@nestjs/testing';

import { type Response } from 'express';

import {
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { isDefined } from 'twenty-shared/utils';

import { OAuthPropagatorController } from 'src/engine/core-modules/auth/controllers/oauth-propagator.controller';
import { DomainServerConfigService } from 'src/engine/core-modules/domain/domain-server-config/services/domain-server-config.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

describe('OAuthPropagatorController', () => {
  let controller: OAuthPropagatorController;
  let twentyConfigService: TwentyConfigService;
  let workspaceDomainsService: WorkspaceDomainsService;
  let domainServerConfigService: DomainServerConfigService;

  const mockWorkspace = {
    id: 'workspace-1',
    subdomain: 'acme',
    customDomain: 'custom.example.com' as string | null,
    isCustomDomainEnabled: true,
  } as Partial<WorkspaceEntity>;

  const buildConfigMock = (
    overrides: Record<string, unknown> = {},
  ): Record<string, unknown> => ({
    NODE_ENV: NodeEnvironment.PRODUCTION,
    IS_MULTIWORKSPACE_ENABLED: false,
    FRONTEND_URL: 'https://app.twenty.com',
    SERVER_URL: 'https://api.twenty.com',
    ...overrides,
  });

  const buildResponse = () =>
    ({
      redirect: jest.fn(),
    }) as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OAuthPropagatorController],
      providers: [
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: DomainServerConfigService,
          useValue: {
            getFrontUrl: jest.fn(),
          },
        },
        {
          provide: WorkspaceDomainsService,
          useValue: {
            getWorkspaceByOriginOrDefaultWorkspace: jest.fn(),
          },
        },
        {
          provide: HttpExceptionHandlerService,
          useValue: {
            handleError: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(OAuthPropagatorController);
    twentyConfigService = module.get(TwentyConfigService);
    workspaceDomainsService = module.get(WorkspaceDomainsService);
    domainServerConfigService = module.get(DomainServerConfigService);
  });

  const setupConfig = (config: Record<string, unknown>) => {
    jest.spyOn(twentyConfigService, 'get').mockImplementation(
      (key: string) => config[key],
    );
  };

  describe('propagateOAuthCallback', () => {
    it('should throw BadRequestException when state is missing', async () => {
      setupConfig(buildConfigMock());

      await expect(
        controller.propagateOAuthCallback(
          undefined as unknown as string,
          'code',
          buildResponse(),
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when code is missing', async () => {
      setupConfig(buildConfigMock());

      await expect(
        controller.propagateOAuthCallback(
          'https://app.twenty.com/callback',
          undefined as unknown as string,
          buildResponse(),
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when state is not a valid URL', async () => {
      setupConfig(buildConfigMock());

      await expect(
        controller.propagateOAuthCallback('not-a-url', 'code', buildResponse()),
      ).rejects.toThrow(BadRequestException);
    });

    it('should redirect when the redirect URL hostname matches the frontend URL in single-workspace mode', async () => {
      const config = buildConfigMock();
      setupConfig(config);

      jest
        .spyOn(workspaceDomainsService, 'getWorkspaceByOriginOrDefaultWorkspace')
        .mockResolvedValue(mockWorkspace as WorkspaceEntity);
      jest
        .spyOn(domainServerConfigService, 'getFrontUrl')
        .mockReturnValue(new URL('https://app.twenty.com'));

      const res = buildResponse();

      await controller.propagateOAuthCallback(
        encodeURIComponent('https://app.twenty.com/oauth/callback'),
        'test-code',
        res,
      );

      expect(res.redirect).toHaveBeenCalledWith(
        302,
        expect.stringContaining('https://app.twenty.com/oauth/callback'),
      );
      expect(res.redirect).toHaveBeenCalledWith(
        302,
        expect.stringContaining('code=test-code'),
      );
    });

    it('should redirect to a workspace custom domain when enabled in single-workspace mode', async () => {
      const config = buildConfigMock();
      setupConfig(config);

      jest
        .spyOn(workspaceDomainsService, 'getWorkspaceByOriginOrDefaultWorkspace')
        .mockResolvedValue(mockWorkspace as WorkspaceEntity);
      jest
        .spyOn(domainServerConfigService, 'getFrontUrl')
        .mockReturnValue(new URL('https://app.twenty.com'));

      const res = buildResponse();

      await controller.propagateOAuthCallback(
        encodeURIComponent('https://custom.example.com/oauth/callback'),
        'test-code',
        res,
      );

      expect(res.redirect).toHaveBeenCalledWith(
        302,
        expect.stringContaining('https://custom.example.com/oauth/callback'),
      );
    });

    it('should throw ForbiddenException for an attacker hostname in single-workspace mode (open redirect fix)', async () => {
      const config = buildConfigMock();
      setupConfig(config);

      jest
        .spyOn(workspaceDomainsService, 'getWorkspaceByOriginOrDefaultWorkspace')
        .mockResolvedValue(mockWorkspace as WorkspaceEntity);
      jest
        .spyOn(domainServerConfigService, 'getFrontUrl')
        .mockReturnValue(new URL('https://app.twenty.com'));

      await expect(
        controller.propagateOAuthCallback(
          encodeURIComponent('https://attacker.example.com/phish'),
          'STOLEN_CODE',
          buildResponse(),
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when custom domain is not enabled and hostname does not match frontend URL', async () => {
      const config = buildConfigMock();
      setupConfig(config);

      const workspaceWithoutCustomDomain = {
        ...mockWorkspace,
        isCustomDomainEnabled: false,
        customDomain: null,
      };

      jest
        .spyOn(workspaceDomainsService, 'getWorkspaceByOriginOrDefaultWorkspace')
        .mockResolvedValue(
          workspaceWithoutCustomDomain as WorkspaceEntity,
        );
      jest
        .spyOn(domainServerConfigService, 'getFrontUrl')
        .mockReturnValue(new URL('https://app.twenty.com'));

      await expect(
        controller.propagateOAuthCallback(
          encodeURIComponent('https://evil.example.com/phish'),
          'code',
          buildResponse(),
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow any hostname in development mode', async () => {
      setupConfig(
        buildConfigMock({ NODE_ENV: NodeEnvironment.DEVELOPMENT }),
      );

      jest
        .spyOn(workspaceDomainsService, 'getWorkspaceByOriginOrDefaultWorkspace')
        .mockResolvedValue(mockWorkspace as WorkspaceEntity);

      const res = buildResponse();

      await controller.propagateOAuthCallback(
        encodeURIComponent('https://attacker.example.com/callback'),
        'test-code',
        res,
      );

      expect(res.redirect).toHaveBeenCalledWith(
        302,
        expect.stringContaining('https://attacker.example.com/callback'),
      );
    });

    it('should redirect when workspace is resolved in multi-workspace mode', async () => {
      setupConfig(
        buildConfigMock({ IS_MULTIWORKSPACE_ENABLED: true }),
      );

      jest
        .spyOn(workspaceDomainsService, 'getWorkspaceByOriginOrDefaultWorkspace')
        .mockResolvedValue(mockWorkspace as WorkspaceEntity);

      const res = buildResponse();

      await controller.propagateOAuthCallback(
        encodeURIComponent('https://acme.twenty.com/oauth/callback'),
        'test-code',
        res,
      );

      expect(res.redirect).toHaveBeenCalledWith(
        302,
        expect.stringContaining('https://acme.twenty.com/oauth/callback'),
      );
    });

    it('should throw ForbiddenException when no workspace is resolved in multi-workspace mode', async () => {
      setupConfig(
        buildConfigMock({ IS_MULTIWORKSPACE_ENABLED: true }),
      );

      jest
        .spyOn(workspaceDomainsService, 'getWorkspaceByOriginOrDefaultWorkspace')
        .mockResolvedValue(undefined);

      await expect(
        controller.propagateOAuthCallback(
          encodeURIComponent('https://unregistered.example.com/callback'),
          'code',
          buildResponse(),
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should pass code and state as query params in the redirect', async () => {
      setupConfig(buildConfigMock());

      jest
        .spyOn(workspaceDomainsService, 'getWorkspaceByOriginOrDefaultWorkspace')
        .mockResolvedValue(mockWorkspace as WorkspaceEntity);
      jest
        .spyOn(domainServerConfigService, 'getFrontUrl')
        .mockReturnValue(new URL('https://app.twenty.com'));

      const res = buildResponse();
      const state = encodeURIComponent('https://app.twenty.com/oauth/callback');

      await controller.propagateOAuthCallback(state, 'my-auth-code', res);

      const redirectCall = (res.redirect as jest.Mock).mock.calls[0];
      const redirectUrl = redirectCall[1] as string;

      expect(redirectUrl).toContain('code=my-auth-code');
      expect(redirectUrl).toContain(
        `state=${encodeURIComponent(state)}`,
      );
    });

    it('should handle URL-encoded state parameter correctly', async () => {
      setupConfig(buildConfigMock());

      jest
        .spyOn(workspaceDomainsService, 'getWorkspaceByOriginOrDefaultWorkspace')
        .mockResolvedValue(mockWorkspace as WorkspaceEntity);
      jest
        .spyOn(domainServerConfigService, 'getFrontUrl')
        .mockReturnValue(new URL('https://app.twenty.com'));

      const res = buildResponse();
      const originalUrl = 'https://app.twenty.com/path/with%20space';
      const state = encodeURIComponent(originalUrl);

      await controller.propagateOAuthCallback(state, 'code', res);

      const redirectCall = (res.redirect as jest.Mock).mock.calls[0];
      const redirectUrl = redirectCall[1] as string;

      expect(redirectUrl).toContain('https://app.twenty.com/path/with%20space');
    });
  });

  describe('isValidDomain', () => {
    it('should return true in development mode regardless of hostname', async () => {
      setupConfig(
        buildConfigMock({ NODE_ENV: NodeEnvironment.DEVELOPMENT }),
      );

      jest
        .spyOn(workspaceDomainsService, 'getWorkspaceByOriginOrDefaultWorkspace')
        .mockResolvedValue(mockWorkspace as WorkspaceEntity);

      const isValid = await (controller as unknown as {
        isValidDomain: (url: URL) => Promise<boolean>;
      }).isValidDomain(new URL('https://anything.example.com'));

      expect(isValid).toBe(true);
    });

    it('should return false when no workspace is resolved', async () => {
      setupConfig(
        buildConfigMock({ IS_MULTIWORKSPACE_ENABLED: true }),
      );

      jest
        .spyOn(workspaceDomainsService, 'getWorkspaceByOriginOrDefaultWorkspace')
        .mockResolvedValue(undefined);

      const isValid = await (controller as unknown as {
        isValidDomain: (url: URL) => Promise<boolean>;
      }).isValidDomain(new URL('https://unknown.example.com'));

      expect(isValid).toBe(false);
    });

    it('should return true in multi-workspace mode when workspace is resolved', async () => {
      setupConfig(
        buildConfigMock({ IS_MULTIWORKSPACE_ENABLED: true }),
      );

      jest
        .spyOn(workspaceDomainsService, 'getWorkspaceByOriginOrDefaultWorkspace')
        .mockResolvedValue(mockWorkspace as WorkspaceEntity);

      const isValid = await (controller as unknown as {
        isValidDomain: (url: URL) => Promise<boolean>;
      }).isValidDomain(new URL('https://acme.twenty.com'));

      expect(isValid).toBe(true);
    });

    it('should validate hostname against frontend URL in single-workspace mode', async () => {
      setupConfig(buildConfigMock());

      jest
        .spyOn(workspaceDomainsService, 'getWorkspaceByOriginOrDefaultWorkspace')
        .mockResolvedValue(mockWorkspace as WorkspaceEntity);
      jest
        .spyOn(domainServerConfigService, 'getFrontUrl')
        .mockReturnValue(new URL('https://app.twenty.com'));

      const isValid = await (controller as unknown as {
        isValidDomain: (url: URL) => Promise<boolean>;
      }).isValidDomain(new URL('https://app.twenty.com/callback'));

      expect(isValid).toBe(true);
    });

    it('should reject mismatched hostname in single-workspace mode', async () => {
      setupConfig(buildConfigMock());

      jest
        .spyOn(workspaceDomainsService, 'getWorkspaceByOriginOrDefaultWorkspace')
        .mockResolvedValue(mockWorkspace as WorkspaceEntity);
      jest
        .spyOn(domainServerConfigService, 'getFrontUrl')
        .mockReturnValue(new URL('https://app.twenty.com'));

      const isValid = await (controller as unknown as {
        isValidDomain: (url: URL) => Promise<boolean>;
      }).isValidDomain(new URL('https://evil.example.com'));

      expect(isValid).toBe(false);
    });

    it('should accept workspace custom domain in single-workspace mode', async () => {
      setupConfig(buildConfigMock());

      jest
        .spyOn(workspaceDomainsService, 'getWorkspaceByOriginOrDefaultWorkspace')
        .mockResolvedValue(mockWorkspace as WorkspaceEntity);
      jest
        .spyOn(domainServerConfigService, 'getFrontUrl')
        .mockReturnValue(new URL('https://app.twenty.com'));

      const isValid = await (controller as unknown as {
        isValidDomain: (url: URL) => Promise<boolean>;
      }).isValidDomain(new URL('https://custom.example.com/callback'));

      expect(isValid).toBe(true);
    });

    it('should reject custom domain when isCustomDomainEnabled is false', async () => {
      setupConfig(buildConfigMock());

      const workspaceWithoutCustomDomain = {
        ...mockWorkspace,
        isCustomDomainEnabled: false,
        customDomain: null,
      };

      jest
        .spyOn(workspaceDomainsService, 'getWorkspaceByOriginOrDefaultWorkspace')
        .mockResolvedValue(
          workspaceWithoutCustomDomain as WorkspaceEntity,
        );
      jest
        .spyOn(domainServerConfigService, 'getFrontUrl')
        .mockReturnValue(new URL('https://app.twenty.com'));

      const isValid = await (controller as unknown as {
        isValidDomain: (url: URL) => Promise<boolean>;
      }).isValidDomain(new URL('https://custom.example.com/callback'));

      expect(isValid).toBe(false);
    });
  });
});
