import { type CanActivate, type ExecutionContext } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Response } from 'express';
import { PermissionFlagType } from 'twenty-shared/constants';

import { AuthExceptionCode } from 'src/engine/core-modules/auth/auth.exception';
import { GoogleAPIsAuthController } from 'src/engine/core-modules/auth/controllers/google-apis-auth.controller';
import { MicrosoftAPIsAuthController } from 'src/engine/core-modules/auth/controllers/microsoft-apis-auth.controller';
import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { GoogleAPIsOauthRequestCodeGuard } from 'src/engine/core-modules/auth/guards/google-apis-oauth-request-code.guard';
import { MicrosoftAPIsOauthRequestCodeGuard } from 'src/engine/core-modules/auth/guards/microsoft-apis-oauth-request-code.guard';
import { ConnectedAccountOAuthService } from 'src/engine/core-modules/auth/services/connected-account-oauth.service';
import { GoogleAPIsService } from 'src/engine/core-modules/auth/services/google-apis.service';
import { MicrosoftAPIsService } from 'src/engine/core-modules/auth/services/microsoft-apis.service';
import { TransientTokenService } from 'src/engine/core-modules/auth/token/services/transient-token.service';
import { type APIsOAuthRequest } from 'src/engine/core-modules/auth/types/apis-oauth-request.type';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { GuardRedirectService } from 'src/engine/core-modules/guard-redirect/services/guard-redirect.service';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

jest.mock(
  'src/engine/core-modules/auth/strategies/google-apis-oauth-request-code.auth.strategy',
  () => ({ GoogleAPIsOauthRequestCodeStrategy: jest.fn() }),
);
jest.mock(
  'src/engine/core-modules/auth/strategies/microsoft-apis-oauth-request-code.auth.strategy',
  () => ({ MicrosoftAPIsOauthRequestCodeStrategy: jest.fn() }),
);

describe.each(['Google', 'Microsoft'] as const)(
  '%s connected account OAuth permissions',
  (provider) => {
    let module: TestingModule;
    let guard: CanActivate;
    let passportCanActivate: jest.SpyInstance;
    let completeCallback: () => Promise<unknown>;

    const verifyTransientToken = jest.fn();
    const userHasWorkspaceSettingPermission = jest.fn();
    const refreshToken = jest.fn();
    const completeOnboardingConnectAccountStep = jest.fn();
    const dispatchErrorFromGuard = jest.fn();
    const getRedirectErrorUrlAndCaptureExceptions = jest.fn();
    const findUserWorkspace = jest.fn();
    const redirect = jest.fn();
    const request = {
      params: {},
      query: { transientToken: 'transient-token' },
      user: {
        emails: [{ value: 'member@example.com' }],
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        transientToken: 'transient-token',
      },
    } as unknown as APIsOAuthRequest;
    const response = { redirect } as unknown as Response;
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as unknown as ExecutionContext;

    beforeEach(async () => {
      verifyTransientToken.mockResolvedValue({
        workspaceId: 'workspace-id',
        userId: 'user-id',
        workspaceMemberId: 'workspace-member-id',
      });
      userHasWorkspaceSettingPermission.mockResolvedValue(false);
      findUserWorkspace.mockResolvedValue({ id: 'user-workspace-id' });
      refreshToken.mockResolvedValue('connected-account-id');
      getRedirectErrorUrlAndCaptureExceptions.mockReturnValue('/error');

      module = await Test.createTestingModule({
        providers: [
          ConnectedAccountOAuthService,
          GoogleAPIsAuthController,
          MicrosoftAPIsAuthController,
          GoogleAPIsOauthRequestCodeGuard,
          MicrosoftAPIsOauthRequestCodeGuard,
          {
            provide: TransientTokenService,
            useValue: { verifyTransientToken },
          },
          {
            provide: PermissionsService,
            useValue: { userHasWorkspaceSettingPermission },
          },
          {
            provide: getRepositoryToken(UserWorkspaceEntity),
            useValue: { findOneBy: findUserWorkspace },
          },
          {
            provide: getRepositoryToken(WorkspaceEntity),
            useValue: {
              findOneBy: jest.fn().mockResolvedValue({
                id: 'workspace-id',
                subdomain: 'workspace',
              }),
            },
          },
          {
            provide: GoogleAPIsService,
            useValue: { refreshGoogleRefreshToken: refreshToken },
          },
          {
            provide: MicrosoftAPIsService,
            useValue: { refreshMicrosoftRefreshToken: refreshToken },
          },
          {
            provide: TwentyConfigService,
            useValue: { get: jest.fn().mockReturnValue(true) },
          },
          {
            provide: OnboardingService,
            useValue: { completeOnboardingConnectAccountStep },
          },
          {
            provide: WorkspaceDomainsService,
            useValue: {
              getSubdomainAndCustomDomainFromWorkspaceFallbackOnDefaultSubdomain:
                jest.fn().mockReturnValue({ subdomain: 'workspace' }),
              buildWorkspaceURL: jest
                .fn()
                .mockReturnValue(new URL('https://workspace.example.com')),
            },
          },
          {
            provide: GuardRedirectService,
            useValue: {
              dispatchErrorFromGuard,
              getRedirectErrorUrlAndCaptureExceptions,
            },
          },
        ],
      })
        .overrideFilter(AuthRestApiExceptionFilter)
        .useValue({})
        .compile();

      guard =
        provider === 'Google'
          ? module.get(GoogleAPIsOauthRequestCodeGuard)
          : module.get(MicrosoftAPIsOauthRequestCodeGuard);
      completeCallback =
        provider === 'Google'
          ? () =>
              module
                .get(GoogleAPIsAuthController)
                .googleAuthGetAccessToken(request, response)
          : () =>
              module
                .get(MicrosoftAPIsAuthController)
                .MicrosoftAuthGetAccessToken(request, response);

      passportCanActivate = jest
        .spyOn(
          Object.getPrototypeOf(Object.getPrototypeOf(guard)),
          'canActivate',
        )
        .mockResolvedValue(true);
    });

    afterEach(async () => {
      jest.restoreAllMocks();
      jest.resetAllMocks();
      await module?.close();
    });

    it('rejects connecting an account when the role has no account permission', async () => {
      await expect(guard.canActivate(context)).resolves.toBe(false);

      expect(passportCanActivate).not.toHaveBeenCalled();
      expect(dispatchErrorFromGuard).toHaveBeenCalledWith(
        context,
        expect.objectContaining({
          code: AuthExceptionCode.FORBIDDEN_EXCEPTION,
        }),
        expect.anything(),
      );
    });

    it('allows connecting an account when the role has account permission', async () => {
      userHasWorkspaceSettingPermission.mockResolvedValue(true);

      await expect(guard.canActivate(context)).resolves.toBe(true);
      await completeCallback();

      expect(userHasWorkspaceSettingPermission).toHaveBeenCalledWith({
        userWorkspaceId: 'user-workspace-id',
        workspaceId: 'workspace-id',
        setting: PermissionFlagType.CONNECTED_ACCOUNTS,
        applicationId: undefined,
      });
      expect(refreshToken).toHaveBeenCalledTimes(1);
      expect(completeOnboardingConnectAccountStep).toHaveBeenCalledTimes(1);
      expect(redirect).toHaveBeenCalledWith('https://workspace.example.com/');
    });

    it('rejects tokens without a user before looking up workspace membership', async () => {
      verifyTransientToken.mockResolvedValue({ workspaceId: 'workspace-id' });

      await expect(guard.canActivate(context)).resolves.toBe(false);

      expect(findUserWorkspace).not.toHaveBeenCalled();
      expect(passportCanActivate).not.toHaveBeenCalled();
    });

    it('rejects users who no longer belong to the workspace', async () => {
      findUserWorkspace.mockResolvedValue(null);

      await expect(guard.canActivate(context)).resolves.toBe(false);

      expect(userHasWorkspaceSettingPermission).not.toHaveBeenCalled();
      expect(passportCanActivate).not.toHaveBeenCalled();
      expect(dispatchErrorFromGuard).toHaveBeenCalledWith(
        context,
        expect.objectContaining({
          code: AuthExceptionCode.USER_WORKSPACE_NOT_FOUND,
        }),
        expect.anything(),
      );
    });

    it('rejects saving the account when permission is revoked during OAuth', async () => {
      userHasWorkspaceSettingPermission.mockResolvedValue(true);

      await expect(guard.canActivate(context)).resolves.toBe(true);

      userHasWorkspaceSettingPermission.mockResolvedValue(false);

      await completeCallback();

      expect(refreshToken).not.toHaveBeenCalled();
      expect(completeOnboardingConnectAccountStep).not.toHaveBeenCalled();
      expect(getRedirectErrorUrlAndCaptureExceptions).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: AuthExceptionCode.FORBIDDEN_EXCEPTION,
          }),
        }),
      );
      expect(redirect).toHaveBeenCalledWith('/error');
    });
  },
);
