import {
  Controller,
  Get,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { Response } from 'express';

import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { MicrosoftOAuthGuard } from 'src/engine/core-modules/auth/guards/microsoft-oauth.guard';
import { MicrosoftProviderEnabledGuard } from 'src/engine/core-modules/auth/guards/microsoft-provider-enabled.guard';
import { AuthService } from 'src/engine/core-modules/auth/services/auth.service';
import { MicrosoftRequest } from 'src/engine/core-modules/auth/strategies/microsoft.auth.strategy';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/service/domain-manager.service';
import { SocialSsoService } from 'src/engine/core-modules/auth/services/social-sso.service';

@Controller('auth/microsoft')
@UseFilters(AuthRestApiExceptionFilter)
export class MicrosoftAuthController {
  constructor(
    private readonly loginTokenService: LoginTokenService,
    private readonly authService: AuthService,
    private readonly domainManagerService: DomainManagerService,
    private readonly socialSsoService: SocialSsoService,
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
    const signInUpParams = req.user;

    const currentWorkspace =
      await this.socialSsoService.findWorkspaceFromOriginAndAuthProvider(
        signInUpParams.workspaceOrigin,
        {
          email: signInUpParams.email,
          authProvider: 'microsoft',
        },
      );

    try {
      const { user, workspace } = await this.authService.signInUp({
        ...signInUpParams,
        fromSSO: true,
        authProvider: 'microsoft',
      });

      const loginToken = await this.loginTokenService.generateLoginToken(
        user.email,
        workspace.id,
      );

      return res.redirect(
        this.authService.computeRedirectURI({
          loginToken: loginToken.token,
          subdomain: workspace.subdomain,
          hostname: workspace.hostname,
          billingCheckoutSessionState:
            signInUpParams.billingCheckoutSessionState,
        }),
      );
    } catch (err) {
      if (err instanceof AuthException) {
        return res.redirect(
          this.domainManagerService.computeRedirectErrorUrl(err.message, {
            hostname: currentWorkspace?.hostname,
            subdomain: currentWorkspace?.subdomain,
          }),
        );
      }
      throw err;
    }
  }
}
