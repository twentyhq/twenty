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
import { AuthOAuthExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-oauth-exception.filter';
import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { GoogleOauthGuard } from 'src/engine/core-modules/auth/guards/google-oauth.guard';
import { GoogleProviderEnabledGuard } from 'src/engine/core-modules/auth/guards/google-provider-enabled.guard';
import { AuthService } from 'src/engine/core-modules/auth/services/auth.service';
import { GoogleRequest } from 'src/engine/core-modules/auth/strategies/google.auth.strategy';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/service/domain-manager.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { SocialSsoService } from 'src/engine/core-modules/auth/services/social-sso.service';

@Controller('auth/google')
@UseFilters(AuthRestApiExceptionFilter)
export class GoogleAuthController {
  constructor(
    private readonly loginTokenService: LoginTokenService,
    private readonly authService: AuthService,
    private readonly domainManagerService: DomainManagerService,
    private readonly environmentService: EnvironmentService,
    private readonly socialSsoService: SocialSsoService,
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
    try {
      const {
        firstName,
        lastName,
        email,
        picture,
        workspaceInviteHash,
        workspacePersonalInviteToken,
        workspaceOrigin,
        billingCheckoutSessionState,
      } = req.user;

      const currentWorkspace =
        await this.socialSsoService.findWorkspaceFromOriginAndAuthProvider(
          workspaceOrigin,
          {
            email,
            authProvider: 'google',
          },
        );

      const invitation = this.socialSsoService.findOneInvitation({
        workspaceId: currentWorkspace.id,
        email,
        inviteHash: workspaceInviteHash,
        personalInviteToken: workspacePersonalInviteToken,
      });

      const { user, workspace } = await this.authService.signInUp({
        email,
        firstName,
        lastName,
        picture,
        invitation,
        workspace: currentWorkspace,
        fromSSO: true,
        isAuthEnabled: 'google',
      });

      const loginToken = await this.loginTokenService.generateLoginToken(
        user.email,
        workspace.id,
      );

      return res.redirect(
        this.authService.computeRedirectURI(
          loginToken.token,
          workspace.subdomain,
          billingCheckoutSessionState,
        ),
      );
    } catch (err) {
      if (err instanceof AuthException) {
        return res.redirect(
          this.domainManagerService.computeRedirectErrorUrl({
            subdomain:
              req.user.targetWorkspaceSubdomain ??
              this.environmentService.get('DEFAULT_SUBDOMAIN'),
            errorMessage: err.message,
          }),
        );
      }
      throw err;
    }
  }
}
