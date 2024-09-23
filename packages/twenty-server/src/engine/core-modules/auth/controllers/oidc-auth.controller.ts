import {
  Controller,
  Get,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { Response } from 'express';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { OIDCOAuthGuard } from 'src/engine/core-modules/auth/guards/oidc-oauth.guard';
import { OIDCProviderEnabledGuard } from 'src/engine/core-modules/auth/guards/oidc-provider-enabled.guard';
import { AuthService } from 'src/engine/core-modules/auth/services/auth.service';
import { OIDCRequest } from 'src/engine/core-modules/auth/strategies/oidc.auth.strategy';
import { TokenService } from 'src/engine/core-modules/auth/token/services/token.service';

@Controller('auth/oidc')
@UseFilters(AuthRestApiExceptionFilter)
export class OIDCAuthController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly typeORMService: TypeORMService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  @UseGuards(OIDCProviderEnabledGuard, OIDCOAuthGuard)
  async oidcAuth() {
    // As this method is protected by OIDC Auth guard, it will trigger OIDC SSO flow
    return;
  }

  @Get('redirect')
  @UseGuards(OIDCProviderEnabledGuard, OIDCOAuthGuard)
  async oidcAuthRedirect(@Req() req: OIDCRequest, @Res() res: Response) {
    const {
      firstName,
      lastName,
      email,
      picture,
      workspaceInviteHash,
      workspacePersonalInviteToken,
    } = req.user;

    const user = await this.authService.signInUp({
      email,
      firstName,
      lastName,
      picture,
      workspaceInviteHash,
      workspacePersonalInviteToken,
      fromSSO: true,
    });

    const loginToken = await this.tokenService.generateLoginToken(user.email);

    return res.redirect(this.tokenService.computeRedirectURI(loginToken.token));
  }
}
