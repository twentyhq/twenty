import {
  Controller,
  Get,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { Response } from 'express';

import { GoogleAPIsOauthExchangeCodeForTokenGuard } from 'src/engine/core-modules/auth/guards/google-apis-oauth-exchange-code-for-token.guard';
import { GoogleAPIsOauthRequestCodeGuard } from 'src/engine/core-modules/auth/guards/google-apis-oauth-request-code.guard';
import { GoogleAPIsService } from 'src/engine/core-modules/auth/services/google-apis.service';
import { TokenService } from 'src/engine/core-modules/auth/services/token.service';
import { GoogleAPIsRequest } from 'src/engine/core-modules/auth/types/google-api-request.type';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { LoadServiceWithWorkspaceContext } from 'src/engine/twenty-orm/context/load-service-with-workspace.context';

@Controller('auth/google-apis')
export class GoogleAPIsAuthController {
  constructor(
    private readonly googleAPIsService: GoogleAPIsService,
    private readonly tokenService: TokenService,
    private readonly environmentService: EnvironmentService,
    private readonly onboardingService: OnboardingService,
    private readonly loadServiceWithWorkspaceContext: LoadServiceWithWorkspaceContext,
  ) {}

  @Get()
  @UseGuards(GoogleAPIsOauthRequestCodeGuard)
  async googleAuth() {
    // As this method is protected by Google Auth guard, it will trigger Google SSO flow
    return;
  }

  @Get('get-access-token')
  @UseGuards(GoogleAPIsOauthExchangeCodeForTokenGuard)
  async googleAuthGetAccessToken(
    @Req() req: GoogleAPIsRequest,
    @Res() res: Response,
  ) {
    const { user } = req;

    const {
      emails,
      accessToken,
      refreshToken,
      transientToken,
      redirectLocation,
      calendarVisibility,
      messageVisibility,
    } = user;

    const { workspaceMemberId, userId, workspaceId } =
      await this.tokenService.verifyTransientToken(transientToken);

    const demoWorkspaceIds = this.environmentService.get('DEMO_WORKSPACE_IDS');

    if (demoWorkspaceIds.includes(workspaceId)) {
      throw new UnauthorizedException(
        'Cannot connect Google account to demo workspace',
      );
    }

    if (!workspaceId) {
      throw new Error('Workspace not found');
    }

    const handle = emails[0].value;

    const googleAPIsServiceInstance =
      await this.loadServiceWithWorkspaceContext.load(
        this.googleAPIsService,
        workspaceId,
      );

    await googleAPIsServiceInstance.refreshGoogleRefreshToken({
      handle,
      workspaceMemberId: workspaceMemberId,
      workspaceId: workspaceId,
      accessToken,
      refreshToken,
      calendarVisibility,
      messageVisibility,
    });

    if (userId) {
      const onboardingServiceInstance =
        await this.loadServiceWithWorkspaceContext.load(
          this.onboardingService,
          workspaceId,
        );

      await onboardingServiceInstance.toggleOnboardingConnectAccountCompletion({
        userId,
        workspaceId,
        value: true,
      });
    }

    return res.redirect(
      `${this.environmentService.get('FRONT_BASE_URL')}${
        redirectLocation || '/settings/accounts'
      }`,
    );
  }
}
