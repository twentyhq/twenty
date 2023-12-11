import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';

import { Response } from 'express';

import { GoogleGmailProviderEnabledGuard } from 'src/core/auth/guards/google-gmail-provider-enabled.guard';
import { GoogleGmailOauthGuard } from 'src/core/auth/guards/google-gmail-oauth.guard';
import { GoogleGmailRequest } from 'src/core/auth/strategies/google-gmail.auth.strategy';
import { GoogleGmailService } from 'src/core/auth/services/google-gmail.service';
import { TokenService } from 'src/core/auth/services/token.service';

@Controller('auth/google-gmail')
export class GoogleGmailAuthController {
  constructor(
    private readonly googleGmailService: GoogleGmailService,
    private readonly tokenService: TokenService,
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
    const { user: gmailUser } = req;

    const { accessToken, refreshToken, transientToken } = gmailUser;

    const { workspaceMemberId, workspaceId } =
      await this.tokenService.verifyTransientToken(transientToken);

    this.googleGmailService.saveConnectedAccount({
      workspaceMemberId: workspaceMemberId,
      workspaceId: workspaceId,
      type: 'gmail',
      accessToken,
      refreshToken,
    });

    return res.redirect('http://localhost:3001');
  }
}
