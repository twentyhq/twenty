import {
  Controller,
  Get,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { Response } from 'express';

import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { Auth0OauthGuard } from 'src/engine/core-modules/auth/guards/auth0-oauth.guard';
import { Auth0ProviderEnabledGuard } from 'src/engine/core-modules/auth/guards/auth0-provider-enabled.guard';
import { AuthService } from 'src/engine/core-modules/auth/services/auth.service';
import { Auth0Request } from 'src/engine/core-modules/auth/strategies/auth0.auth.strategy';
import { TokenService } from 'src/engine/core-modules/auth/token/services/token.service';

@Controller('auth/auth0')
@UseFilters(AuthRestApiExceptionFilter)
export class Auth0AuthController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  @UseGuards(Auth0ProviderEnabledGuard, Auth0OauthGuard)
  async auth0Auth() {
    // As this method is protected by Auth0 Auth guard, it will trigger Auth0 SSO flow
    return;
  }

  @Get('redirect')
  @UseGuards(Auth0ProviderEnabledGuard, Auth0OauthGuard)
  async auth0AuthRedirect(@Req() req: Auth0Request, @Res() res: Response) {
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
