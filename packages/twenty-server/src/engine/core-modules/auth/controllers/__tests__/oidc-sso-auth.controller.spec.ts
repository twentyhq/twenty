import { Test, type TestingModule } from '@nestjs/testing';
import { type Response } from 'express';

import { OidcSocialAuthController } from 'src/engine/core-modules/auth/controllers/oidc-sso-auth.controller';
import { OidcSocialOauthGuard } from 'src/engine/core-modules/auth/guards/oidc-sso-oauth.guard';
import { OidcSocialProviderEnabledGuard } from 'src/engine/core-modules/auth/guards/oidc-sso-provider-enabled.guard';
import { AuthService } from 'src/engine/core-modules/auth/services/auth.service';
import { type OidcSocialRequest } from 'src/engine/core-modules/auth/strategies/oidc-sso.auth.strategy';
import { DomainServerConfigService } from 'src/engine/core-modules/domain/domain-server-config/services/domain-server-config.service';
import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import { GuardRedirectService } from 'src/engine/core-modules/guard-redirect/services/guard-redirect.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';

describe('OidcSocialAuthController', () => {
  let controller: OidcSocialAuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OidcSocialAuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signInUpWithSocialSSO: jest.fn(),
          },
        },
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: GuardRedirectService,
          useValue: {
            dispatchErrorFromGuard: jest.fn(),
            getSubdomainAndCustomDomainFromContext: jest.fn(),
          },
        },
        {
          provide: HttpExceptionHandlerService,
          useValue: {
            handleError: jest.fn(),
          },
        },
        {
          provide: DomainServerConfigService,
          useValue: {
            buildBaseUrl: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(OidcSocialProviderEnabledGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(OidcSocialOauthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<OidcSocialAuthController>(
      OidcSocialAuthController,
    );
    authService = module.get<AuthService>(AuthService);
  });

  describe('oidcAuth', () => {
    it('should be defined', async () => {
      await expect(controller.oidcAuth()).resolves.toBeUndefined();
    });
  });

  describe('oidcAuthRedirect', () => {
    it('should redirect to the URL returned by authService.signInUpWithSocialSSO', async () => {
      const redirectUrl = 'https://app.twenty.com/auth/callback';
      jest
        .spyOn(authService, 'signInUpWithSocialSSO')
        .mockResolvedValue(redirectUrl);

      const mockRequest = {
        user: {
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          picture: 'https://example.com/avatar.png',
          action: 'list-available-workspaces' as const,
        },
      } as unknown as OidcSocialRequest;

      const mockResponse = {
        redirect: jest.fn(),
      } as unknown as Response;

      await controller.oidcAuthRedirect(mockRequest, mockResponse);

      expect(authService.signInUpWithSocialSSO).toHaveBeenCalledWith(
        mockRequest.user,
        AuthProviderEnum.Oidc,
      );
      expect(mockResponse.redirect).toHaveBeenCalledWith(redirectUrl);
    });
  });
});
