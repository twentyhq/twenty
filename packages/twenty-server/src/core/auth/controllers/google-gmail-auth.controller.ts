import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';

import { Response } from 'express';

import { GoogleGmailProviderEnabledGuard } from 'src/core/auth/guards/google-gmail-provider-enabled.guard';
import { GoogleGmailOauthGuard } from 'src/core/auth/guards/google-gmail-oauth.guard';
import { GoogleGmailRequest } from 'src/core/auth/strategies/google-gmail.auth.strategy';
import { GoogleGmailService } from 'src/core/auth/services/google-gmail.service';
import { TokenService } from 'src/core/auth/services/token.service';
import { EnvironmentService } from 'src/integrations/environment/environment.service';

@Controller('auth/google-gmail')
export class GoogleGmailAuthController {
  constructor(
    private readonly googleGmailService: GoogleGmailService,
    private readonly tokenService: TokenService,
    private readonly environmentService: EnvironmentService,
  ) {}

  @Get()
  @UseGuards(GoogleGmailProviderEnabledGuard, GoogleGmailOauthGuard)
  async googleAuth() {
    // As this method is protected by Google Auth guard, it will trigger Google SSO flow
    return;
  }

  @Get('get-access-token')
  @UseGuards(GoogleGmailProviderEnabledGuard, GoogleGmailOauthGuard)
  async googleAuthGetAccessToken(
    @Req() req: GoogleGmailRequest,
    @Res() res: Response,
  ) {
    const { user } = req;

    const { email, accessToken, refreshToken, transientToken } = user;

    const { workspaceMemberId, workspaceId } =
      await this.tokenService.verifyTransientToken(transientToken);

    await this.googleGmailService.saveConnectedAccount({
      handle: email,
      workspaceMemberId: workspaceMemberId,
      workspaceId: workspaceId,
      provider: 'gmail',
      accessToken,
      refreshToken,
    });

    return res.redirect(
      `${this.environmentService.getFrontBaseUrl()}/settings/accounts`,
    );
  }
}
