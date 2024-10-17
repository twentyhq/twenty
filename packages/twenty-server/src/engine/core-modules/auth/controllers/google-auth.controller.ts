import {
  Controller,
  Get,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { Response } from 'express';

import { AuthOAuthExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-oauth-exception.filter';
import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { GoogleOauthGuard } from 'src/engine/core-modules/auth/guards/google-oauth.guard';
import { GoogleProviderEnabledGuard } from 'src/engine/core-modules/auth/guards/google-provider-enabled.guard';
import { AuthService } from 'src/engine/core-modules/auth/services/auth.service';
import { GoogleRequest } from 'src/engine/core-modules/auth/strategies/google.auth.strategy';
import { TokenService } from 'src/engine/core-modules/auth/token/services/token.service';

@Controller('auth/google')
@UseFilters(AuthRestApiExceptionFilter)
export class GoogleAuthController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  @UseGuards(GoogleProviderEnabledGuard, GoogleOauthGuard)
  async googleAuth() {
    // As this method is protected by Google Auth guard, it will trigger Google SSO flow
    return;
  }

  @Get('redirect')
  @UseGuards(GoogleProviderEnabledGuard, GoogleOauthGuard)
  @UseFilters(AuthOAuthExceptionFilter)
  async googleAuthRedirect(@Req() req: GoogleRequest, @Res() res: Response) {
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
