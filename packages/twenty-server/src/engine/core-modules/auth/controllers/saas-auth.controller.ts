import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { randomUUID } from 'crypto';
import { Response } from 'express';
import { AppPath } from 'twenty-shared/types';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { getSaasAuthReceivedCodeCacheKey } from 'src/engine/core-modules/auth/constants/saas-auth-received-code-cache-key.constant';
import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import {
  SaasAuthWorkspaceService,
  type SaasAuthValidateResponseInput,
  type SaasProvisionedLogin,
} from 'src/engine/core-modules/auth/services/saas-auth-workspace.service';
import { AuthService } from 'src/engine/core-modules/auth/services/auth.service';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { GuardRedirectService } from 'src/engine/core-modules/guard-redirect/services/guard-redirect.service';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

type SaasPendingLogin = SaasProvisionedLogin;

type CompleteSaasLoginBody = {
  pendingLoginToken?: string;
  businessId?: string;
};

const SAAS_PENDING_LOGIN_CACHE_PREFIX = 'saas-auth:pending-login';
const SAAS_SELECT_BUSINESS_PATH = '/auth/saas/select-business';

@Controller('auth/saas')
@UseFilters(AuthRestApiExceptionFilter)
export class SaaSAuthController {
  private readonly logger = new Logger(SaaSAuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly guardRedirectService: GuardRedirectService,
    private readonly loginTokenService: LoginTokenService,
    private readonly saasAuthWorkspaceService: SaasAuthWorkspaceService,
    private readonly secureHttpClientService: SecureHttpClientService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly userService: UserService,
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    private readonly cacheStorage: CacheStorageService,
  ) {}

  @Get('callback')
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async callback(@Query('code') code: string, @Res() res: Response) {
    try {
      if (!this.twentyConfigService.get('SAAS_AUTH_ENABLED')) {
        throw new AuthException(
          'SaaS authentication is disabled',
          AuthExceptionCode.FORBIDDEN_EXCEPTION,
        );
      }

      if (!code) {
        throw new AuthException(
          'Missing SaaS authentication code',
          AuthExceptionCode.INVALID_INPUT,
        );
      }

      await this.storeReceivedCode(code);

      const validatedPayload = await this.validateSmartBizCode(code);
      const pendingLogin =
        await this.saasAuthWorkspaceService.provisionWorkspaces(
          validatedPayload,
        );

      if (pendingLogin.businesses.length === 0) {
        throw new AuthException(
          'No mapped CRM business is available for this user',
          AuthExceptionCode.OAUTH_ACCESS_DENIED,
        );
      }

      if (pendingLogin.businesses.length === 1) {
        const redirectUrl = await this.completeLogin({
          pendingLogin,
          businessId: pendingLogin.businesses[0].id,
        });

        return res.redirect(redirectUrl);
      }

      const pendingLoginToken = await this.storePendingLogin(pendingLogin);
      const selectBusinessUrl = new URL(
        `${this.twentyConfigService.get('FRONTEND_URL')}${SAAS_SELECT_BUSINESS_PATH}`,
      );

      selectBusinessUrl.searchParams.set(
        'pendingLoginToken',
        pendingLoginToken,
      );

      return res.redirect(selectBusinessUrl.toString());
    } catch (error) {
      return res.redirect(this.getAuthErrorRedirectUrl(error));
    }
  }

  @Get('pending-login')
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async getPendingLogin(
    @Query('pendingLoginToken') pendingLoginToken: string,
  ): Promise<{ businesses: Array<{ id: string; name: string }> }> {
    const pendingLogin = await this.getPendingLoginOrThrow(pendingLoginToken);

    return {
      businesses: pendingLogin.businesses.map(({ id, name }) => ({
        id,
        name,
      })),
    };
  }

  @Post('complete')
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async complete(@Body() body: CompleteSaasLoginBody) {
    const pendingLogin = await this.consumePendingLoginOrThrow(
      body.pendingLoginToken,
    );

    return {
      redirectUrl: await this.completeLogin({
        pendingLogin,
        businessId: body.businessId,
      }),
    };
  }

  private async validateSmartBizCode(
    code: string,
  ): Promise<SaasAuthValidateResponseInput> {
    try {
      const response = await this.secureHttpClientService
        .getInternalHttpClient({ timeout: 10000 })
        .post<SaasAuthValidateResponseInput>(
          this.twentyConfigService.get('SAAS_AUTH_VALIDATE_URL'),
          { code },
        );

      return response.data;
    } catch (error) {
      this.logger.error(
        'Error validating SaaS authentication code',
        error instanceof Error ? error.stack : undefined,
      );
      throw new AuthException(
        'Смарт биз аутентификация не удалась',
        AuthExceptionCode.OAUTH_ACCESS_DENIED,
      );
    }
  }

  private async storeReceivedCode(code: string) {
    const ttlMs =
      this.twentyConfigService.get('SAAS_AUTH_RECEIVED_CODE_TTL_SECONDS') *
      1000;

    await this.cacheStorage.set(
      getSaasAuthReceivedCodeCacheKey(code),
      true,
      ttlMs,
    );
  }

  private async storePendingLogin(
    pendingLogin: SaasPendingLogin,
  ): Promise<string> {
    const pendingLoginToken = randomUUID();
    const ttlMs =
      this.twentyConfigService.get('SAAS_AUTH_PENDING_LOGIN_TTL_SECONDS') *
      1000;

    await this.cacheStorage.set(
      this.getPendingLoginCacheKey(pendingLoginToken),
      pendingLogin,
      ttlMs,
    );

    return pendingLoginToken;
  }

  private async getPendingLoginOrThrow(
    pendingLoginToken?: string,
  ): Promise<SaasPendingLogin> {
    if (!pendingLoginToken) {
      throw new AuthException(
        'Missing pending SaaS login token',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    const pendingLogin = await this.cacheStorage.get<SaasPendingLogin>(
      this.getPendingLoginCacheKey(pendingLoginToken),
    );

    if (!pendingLogin) {
      throw new AuthException(
        'Pending SaaS login is invalid or expired',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    return pendingLogin;
  }

  private async consumePendingLoginOrThrow(
    pendingLoginToken?: string,
  ): Promise<SaasPendingLogin> {
    if (!pendingLoginToken) {
      throw new AuthException(
        'Missing pending SaaS login token',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    const pendingLogin = await this.getPendingLoginOrThrow(pendingLoginToken);

    await this.cacheStorage.del(
      this.getPendingLoginCacheKey(pendingLoginToken),
    );

    return pendingLogin;
  }

  private async completeLogin({
    pendingLogin,
    businessId,
  }: {
    pendingLogin: SaasPendingLogin;
    businessId?: string;
  }) {
    const selectedBusiness = pendingLogin.businesses.find(
      (business) => business.id === businessId,
    );

    if (!selectedBusiness) {
      throw new AuthException(
        'Selected CRM business is not available for this login',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    const currentWorkspace = await this.authService.findWorkspaceForSignInUp({
      workspaceId: selectedBusiness.workspaceId,
      email: pendingLogin.user.email,
      authProvider: AuthProviderEnum.SSO,
    });

    assertIsDefinedOrThrow(
      currentWorkspace,
      new AuthException(
        'Workspace not found',
        AuthExceptionCode.WORKSPACE_NOT_FOUND,
      ),
    );

    if (currentWorkspace.id !== selectedBusiness.workspaceId) {
      throw new AuthException(
        'Selected CRM business does not map to this workspace',
        AuthExceptionCode.INVALID_DATA,
      );
    }

    const invitation = await this.authService.findInvitationForSignInUp({
      currentWorkspace,
      email: pendingLogin.user.email,
    });

    const existingUser = await this.userService.findUserByEmail(
      pendingLogin.user.email,
    );

    const { userData } = this.authService.formatUserDataPayload(
      {
        email: pendingLogin.user.email,
        firstName: pendingLogin.user.firstName,
        lastName: pendingLogin.user.lastName,
        isEmailAlreadyVerified: true,
      },
      existingUser,
    );

    await this.authService.checkAccessForSignIn({
      userData,
      invitation,
      workspace: currentWorkspace,
    });

    const { workspace, user } = await this.authService.signInUp({
      userData,
      workspace: currentWorkspace,
      invitation,
      authParams: {
        provider: AuthProviderEnum.SSO,
      },
    });

    const loginToken = await this.loginTokenService.generateLoginToken(
      user.email,
      workspace.id,
      AuthProviderEnum.SSO,
    );

    return this.authService.computeRedirectURI({
      loginToken: loginToken.token,
      workspace,
    });
  }

  private getPendingLoginCacheKey(pendingLoginToken: string) {
    return `${SAAS_PENDING_LOGIN_CACHE_PREFIX}:${pendingLoginToken}`;
  }

  private getAuthErrorRedirectUrl(error: unknown) {
    return this.guardRedirectService.getRedirectErrorUrlAndCaptureExceptions({
      error:
        error instanceof Error
          ? error
          : new Error('SaaS authentication failed'),
      workspace: {
        subdomain: this.twentyConfigService.get('DEFAULT_SUBDOMAIN'),
        customDomain: null,
      },
      pathname: AppPath.Verify,
    });
  }
}
