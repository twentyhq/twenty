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

import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { MicrosoftOAuthGuard } from 'src/engine/core-modules/auth/guards/microsoft-oauth.guard';
import { MicrosoftProviderEnabledGuard } from 'src/engine/core-modules/auth/guards/microsoft-provider-enabled.guard';
import { AuthService } from 'src/engine/core-modules/auth/services/auth.service';
import { MicrosoftRequest } from 'src/engine/core-modules/auth/strategies/microsoft.auth.strategy';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/service/domain-manager.service';
import { User } from 'src/engine/core-modules/user/user.entity';

@Controller('auth/microsoft')
@UseFilters(AuthRestApiExceptionFilter)
export class MicrosoftAuthController {
  constructor(
    private readonly loginTokenService: LoginTokenService,
    private readonly authService: AuthService,
    private readonly domainManagerService: DomainManagerService,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
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
    const {
      firstName,
      lastName,
      email,
      picture,
      workspaceInviteHash,
      workspacePersonalInviteToken,
      workspaceId,
      billingCheckoutSessionState,
    } = req.user;

    const currentWorkspace = await this.authService.findWorkspaceForSignInUp({
      workspaceId,
      workspaceInviteHash,
      email,
      authProvider: 'microsoft',
    });

    try {
      const invitation = await this.authService.findInvitationForSignInUp({
        currentWorkspace,
        workspacePersonalInviteToken,
        email,
      });

      const existingUser = await this.userRepository.findOne({
        where: { email },
      });

      const { userData } = this.authService.formatUserDataPayload(
        {
          firstName,
          lastName,
          email,
          picture,
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
          provider: 'microsoft',
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
          subdomain: workspace.subdomain,

          billingCheckoutSessionState,
        }),
      );
    } catch (err) {
      if (err instanceof AuthException) {
        return res.redirect(
          this.domainManagerService.computeRedirectErrorUrl(err.message, {
            subdomain: currentWorkspace?.subdomain,
          }),
        );
      }
      throw err;
    }
  }
}
