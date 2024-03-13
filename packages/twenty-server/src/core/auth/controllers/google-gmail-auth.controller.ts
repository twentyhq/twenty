import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';

import { Response } from 'express';

import { GoogleAPIsOauthGuard } from 'src/core/auth/guards/google-apis-oauth.guard';
import { GoogleAPIsProviderEnabledGuard } from 'src/core/auth/guards/google-apis-provider-enabled.guard';
import { GoogleAPIsService } from 'src/core/auth/services/google-apis.service';
import { TokenService } from 'src/core/auth/services/token.service';
import { GoogleAPIsRequest } from 'src/core/auth/strategies/google-apis.auth.strategy';
import { EnvironmentService } from 'src/integrations/environment/environment.service';

@Controller('auth/google-gmail')
export class GoogleGmailAuthController {
  constructor(
    private readonly googleGmailService: GoogleAPIsService,
    private readonly tokenService: TokenService,
    private readonly environmentService: EnvironmentService,
  ) {}

  @Get()
  @UseGuards(GoogleAPIsProviderEnabledGuard, GoogleAPIsOauthGuard)
  async googleAuth() {
    // As this method is protected by Google Auth guard, it will trigger Google SSO flow
    return;
  }

  @Get('get-access-token')
  @UseGuards(GoogleAPIsProviderEnabledGuard, GoogleAPIsOauthGuard)
  async googleAuthGetAccessToken(
    @Req() req: GoogleAPIsRequest,
    @Res() res: Response,
  ) {
    const { user } = req;

    const { email, accessToken, refreshToken, transientToken } = user;

    const { workspaceMemberId, workspaceId } =
      await this.tokenService.verifyTransientToken(transientToken);

    const demoWorkspaceIds = this.environmentService.getDemoWorkspaceIds();

    if (demoWorkspaceIds.includes(workspaceId)) {
      throw new Error('Cannot connect Gmail account to demo workspace');
    }

    if (!workspaceId) {
      throw new Error('Workspace not found');
    }

    if (workspaceId)
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
