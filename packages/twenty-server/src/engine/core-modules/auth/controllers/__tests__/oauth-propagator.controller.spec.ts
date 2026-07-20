import { Test, type TestingModule } from '@nestjs/testing';

import { type Response } from 'express';

import { BadRequestException, ForbiddenException } from '@nestjs/common';

import { OAuthPropagatorController } from 'src/engine/core-modules/auth/controllers/oauth-propagator.controller';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

describe('OAuthPropagatorController', () => {
  let controller: OAuthPropagatorController;
  let twentyConfigService: TwentyConfigService;
  let workspaceDomainsService: WorkspaceDomainsService;

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
          provide: WorkspaceDomainsService,
          useValue: {
            isRedirectUrlWithinResolvedWorkspaceDomains: jest.fn(),
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
  });

  const setupConfig = (config: Record<string, unknown>) => {
    jest.spyOn(twentyConfigService, 'get').mockImplementation((key: string) => {
      return config[key] as string | boolean | undefined;
    });
  };

  const mockDomainDecision = (isValid: boolean) => {
    jest
      .spyOn(
        workspaceDomainsService,
        'isRedirectUrlWithinResolvedWorkspaceDomains',
      )
      .mockResolvedValue(isValid);
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

    it('should throw BadRequestException when the redirect URI contains a fragment', async () => {
      setupConfig(buildConfigMock());

      await expect(
        controller.propagateOAuthCallback(
          encodeURIComponent('https://app.twenty.com/callback#fragment'),
          'code',
          buildResponse(),
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when the redirect URI is non-https and non-localhost', async () => {
      setupConfig(buildConfigMock());

      await expect(
        controller.propagateOAuthCallback(
          encodeURIComponent('http://app.twenty.com/callback'),
          'code',
          buildResponse(),
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should redirect when the redirect origin is within workspace domains in single-workspace mode', async () => {
      setupConfig(buildConfigMock());
      mockDomainDecision(true);

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

    it('should throw ForbiddenException for an attacker hostname in single-workspace mode (open redirect fix)', async () => {
      setupConfig(buildConfigMock());
      mockDomainDecision(false);

      await expect(
        controller.propagateOAuthCallback(
          encodeURIComponent('https://attacker.example.com/phish'),
          'STOLEN_CODE',
          buildResponse(),
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should redirect when the redirect origin matches a workspace in multi-workspace mode', async () => {
      setupConfig(buildConfigMock({ IS_MULTIWORKSPACE_ENABLED: true }));
      mockDomainDecision(true);

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

    it('should throw ForbiddenException for an unregistered host in multi-workspace mode', async () => {
      setupConfig(buildConfigMock({ IS_MULTIWORKSPACE_ENABLED: true }));
      mockDomainDecision(false);

      await expect(
        controller.propagateOAuthCallback(
          encodeURIComponent('https://unregistered.example.com/callback'),
          'code',
          buildResponse(),
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow any host in development mode without resolving workspace domains', async () => {
      setupConfig(buildConfigMock({ NODE_ENV: NodeEnvironment.DEVELOPMENT }));

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
      expect(
        workspaceDomainsService.isRedirectUrlWithinResolvedWorkspaceDomains,
      ).not.toHaveBeenCalled();
    });

    it('should pass code and state as query params in the redirect', async () => {
      setupConfig(buildConfigMock());
      mockDomainDecision(true);

      const res = buildResponse();
      const state = encodeURIComponent('https://app.twenty.com/oauth/callback');

      await controller.propagateOAuthCallback(state, 'my-auth-code', res);

      const redirectCall = (res.redirect as jest.Mock).mock.calls[0];
      const redirectUrl = redirectCall[1] as string;

      expect(redirectUrl).toContain('code=my-auth-code');
      expect(redirectUrl).toContain(`state=${encodeURIComponent(state)}`);
    });

    it('should handle URL-encoded state parameter correctly', async () => {
      setupConfig(buildConfigMock());
      mockDomainDecision(true);

      const res = buildResponse();
      const originalUrl = 'https://app.twenty.com/path/with%20space';
      const state = encodeURIComponent(originalUrl);

      await controller.propagateOAuthCallback(state, 'code', res);

      const redirectCall = (res.redirect as jest.Mock).mock.calls[0];
      const redirectUrl = redirectCall[1] as string;

      expect(redirectUrl).toContain('https://app.twenty.com/path/with%20space');
    });
  });
});
