import {
  Controller,
  Get,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { Response } from 'express';
import { ApiPath } from 'twenty-shared/types';

import { AuthOAuthExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-oauth-exception.filter';
import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { OidcSocialOauthGuard } from 'src/engine/core-modules/auth/guards/oidc-sso-oauth.guard';
import { OidcSocialProviderEnabledGuard } from 'src/engine/core-modules/auth/guards/oidc-sso-provider-enabled.guard';
import { AuthService } from 'src/engine/core-modules/auth/services/auth.service';
import { OidcSocialRequest } from 'src/engine/core-modules/auth/strategies/oidc-sso.auth.strategy';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

@Controller(`${ApiPath.Auth}/openid`)
@UseFilters(AuthRestApiExceptionFilter)
export class OidcSocialAuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @UseGuards(
    OidcSocialProviderEnabledGuard,
    OidcSocialOauthGuard,
    PublicEndpointGuard,
    NoPermissionGuard,
  )
  async oidcAuth() {
    // Triggers OpenID Connect social authentication flow
    return;
  }

  @Get('redirect')
  @UseGuards(
    OidcSocialProviderEnabledGuard,
    OidcSocialOauthGuard,
    PublicEndpointGuard,
    NoPermissionGuard,
  )
  @UseFilters(AuthOAuthExceptionFilter)
  async oidcAuthRedirect(
    @Req() req: OidcSocialRequest,
    @Res() res: Response,
  ) {
    return res.redirect(
      await this.authService.signInUpWithSocialSSO(
        req.user,
        AuthProviderEnum.Oidc,
      ),
    );
  }
}
