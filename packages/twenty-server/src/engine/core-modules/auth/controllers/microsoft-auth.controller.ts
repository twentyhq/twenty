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
import { MicrosoftOAuthGuard } from 'src/engine/core-modules/auth/guards/microsoft-oauth.guard';
import { MicrosoftProviderEnabledGuard } from 'src/engine/core-modules/auth/guards/microsoft-provider-enabled.guard';
import { AuthService } from 'src/engine/core-modules/auth/services/auth.service';
import { MicrosoftRequest } from 'src/engine/core-modules/auth/strategies/microsoft.auth.strategy';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/service/domain-manager.service';

@Controller('auth/microsoft')
@UseFilters(AuthRestApiExceptionFilter)
export class MicrosoftAuthController {
  constructor(
    private readonly loginTokenService: LoginTokenService,
    private readonly authService: AuthService,
    private readonly domainManagerService: DomainManagerService,
    private readonly environmentService: EnvironmentService,
  ) {}

  @Get()
  @UseGuards(MicrosoftProviderEnabledGuard, MicrosoftOAuthGuard)
  async microsoftAuth() {
    // As this method is protected by Microsoft Auth guard, it will trigger Microsoft SSO flow
    return;
  }

  @Get('redirect')
  @UseGuards(MicrosoftProviderEnabledGuard, MicrosoftOAuthGuard)
  async microsoftAuthRedirect(
    @Req() req: MicrosoftRequest,
    @Res() res: Response,
  ) {
    try {
      const {
        firstName,
        lastName,
        email,
        picture,
        workspaceInviteHash,
        workspacePersonalInviteToken,
        targetWorkspaceSubdomain,
      } = req.user;

      const user = await this.authService.signInUp({
        email,
        firstName,
        lastName,
        picture,
        workspaceInviteHash,
        workspacePersonalInviteToken,
        targetWorkspaceSubdomain,
        fromSSO: true,
        authProvider: 'microsoft',
      });

      const loginToken = await this.loginTokenService.generateLoginToken(
        user.email,
      );

      return res.redirect(
        await this.authService.computeRedirectURI(
          loginToken.token,
          user.defaultWorkspace.subdomain,
        ),
      );
    } catch (err) {
      if (err instanceof AuthException) {
        return res.redirect(
          this.domainManagerService.computeRedirectErrorUrl({
            subdomain: this.environmentService.get('DEFAULT_SUBDOMAIN'),
            errorMessage: err.message,
          }),
        );
      }
      throw err;
    }
  }
}
