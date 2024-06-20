import {
  Controller,
  Get,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { Response } from 'express';

import { GoogleAPIsProviderEnabledGuard } from 'src/engine/core-modules/auth/guards/google-apis-provider-enabled.guard';
import { GoogleAPIsOauthGuard } from 'src/engine/core-modules/auth/guards/google-apis-oauth.guard';
import { GoogleAPIsRequest } from 'src/engine/core-modules/auth/strategies/google-apis.auth.strategy';
import { GoogleAPIsService } from 'src/engine/core-modules/auth/services/google-apis.service';
import { TokenService } from 'src/engine/core-modules/auth/services/token.service';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
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

    const {
      email,
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

    const googleAPIsServiceInstance =
      await this.loadServiceWithWorkspaceContext.load(
        this.googleAPIsService,
        workspaceId,
      );

    await googleAPIsServiceInstance.refreshGoogleRefreshToken({
      handle: email,
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

      await onboardingServiceInstance.skipSyncEmailOnboardingStep(
        userId,
        workspaceId,
      );
    }

    return res.redirect(
      `${this.environmentService.get('FRONT_BASE_URL')}${
        redirectLocation || '/settings/accounts'
      }`,
    );
  }
}
