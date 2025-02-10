import {
  Controller,
  Get,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Response } from 'express';
import { Repository } from 'typeorm';

import { AuthOAuthExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-oauth-exception.filter';
import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { GoogleOauthGuard } from 'src/engine/core-modules/auth/guards/google-oauth.guard';
import { GoogleProviderEnabledGuard } from 'src/engine/core-modules/auth/guards/google-provider-enabled.guard';
import { AuthService } from 'src/engine/core-modules/auth/services/auth.service';
import { GoogleRequest } from 'src/engine/core-modules/auth/strategies/google.auth.strategy';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { GuardRedirectService } from 'src/engine/core-modules/guard-redirect/services/guard-redirect.service';
import { User } from 'src/engine/core-modules/user/user.entity';

@Controller('auth/google')
@UseFilters(AuthRestApiExceptionFilter)
export class GoogleAuthController {
  constructor(
    private readonly loginTokenService: LoginTokenService,
    private readonly authService: AuthService,
    private readonly guardRedirectService: GuardRedirectService,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
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
    const {
      firstName,
      lastName,
      email,
      picture,
      workspaceInviteHash,
      workspaceId,
      billingCheckoutSessionState,
      locale,
    } = req.user;

    const currentWorkspace = await this.authService.findWorkspaceForSignInUp({
      workspaceId,
      workspaceInviteHash,
      email,
      authProvider: 'google',
    });

    try {
      const invitation =
        currentWorkspace && email
          ? await this.authService.findInvitationForSignInUp({
              currentWorkspace,
              email,
            })
          : undefined;

      const existingUser = await this.userRepository.findOne({
        where: { email },
      });

      const { userData } = this.authService.formatUserDataPayload(
        {
          firstName,
          lastName,
          email,
          picture,
          locale,
        },
        existingUser,
      );

      await this.authService.checkAccessForSignIn({
        userData,
        invitation,
        workspaceInviteHash,
        workspace: currentWorkspace,
      });

      const { user, workspace } = await this.authService.signInUp({
        invitation,
        workspace: currentWorkspace,
        userData,
        authParams: {
          provider: 'google',
        },
        billingCheckoutSessionState,
      });

      const loginToken = await this.loginTokenService.generateLoginToken(
        user.email,
        workspace.id,
      );

      return res.redirect(
        this.authService.computeRedirectURI({
          loginToken: loginToken.token,
          workspace,
          billingCheckoutSessionState,
        }),
      );
    } catch (err) {
      return res.redirect(
        this.guardRedirectService.getRedirectErrorUrlAndCaptureExceptions(
          err,
          this.guardRedirectService.getSubdomainAndCustomDomainFromWorkspace(
            currentWorkspace,
          ),
        ),
      );
    }
  }
}
