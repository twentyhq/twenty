import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';

import { Response } from 'express';
import { ApiPath } from 'twenty-shared/types';
import { MicrosoftOAuthGuard } from 'src/engine/core-modules/auth/guards/microsoft-oauth.guard';
import { MicrosoftProviderEnabledGuard } from 'src/engine/core-modules/auth/guards/microsoft-provider-enabled.guard';
import { AuthService } from 'src/engine/core-modules/auth/services/auth.service';
import { MicrosoftRequest } from 'src/engine/core-modules/auth/strategies/microsoft.auth.strategy';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

@Controller(`${ApiPath.Auth}/microsoft`)
export class MicrosoftAuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @UseGuards(
    MicrosoftProviderEnabledGuard,
    MicrosoftOAuthGuard,
    PublicEndpointGuard,
    NoPermissionGuard,
  )
  async microsoftAuth() {
    return;
  }

  @Get('redirect')
  @UseGuards(
    MicrosoftProviderEnabledGuard,
    MicrosoftOAuthGuard,
    PublicEndpointGuard,
    NoPermissionGuard,
  )
  async microsoftAuthRedirect(
    @Req() req: MicrosoftRequest,
    @Res() res: Response,
  ) {
    return res.redirect(
      await this.authService.signInUpWithSocialSso(
        req.user,
        AuthProviderEnum.Microsoft,
      ),
    );
  }
}
