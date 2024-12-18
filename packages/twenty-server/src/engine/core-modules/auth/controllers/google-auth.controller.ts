import {
  Controller,
  Get,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { Response } from 'express';

import { AuthOAuthExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-oauth-exception.filter';
import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { GoogleOauthGuard } from 'src/engine/core-modules/auth/guards/google-oauth.guard';
import { GoogleProviderEnabledGuard } from 'src/engine/core-modules/auth/guards/google-provider-enabled.guard';
import { AuthService } from 'src/engine/core-modules/auth/services/auth.service';
import { GoogleRequest } from 'src/engine/core-modules/auth/strategies/google.auth.strategy';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/service/domain-manager.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Controller('auth/google')
@UseFilters(AuthRestApiExceptionFilter)
export class GoogleAuthController {
  constructor(
    private readonly loginTokenService: LoginTokenService,
    private readonly authService: AuthService,
    private readonly domainManagerService: DomainManagerService,
    private readonly environmentService: EnvironmentService,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
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
        targetWorkspaceSubdomain,
      } = req.user;

      const signInUpParams = {
        email,
        firstName,
        lastName,
        picture,
        workspaceInviteHash,
        workspacePersonalInviteToken,
        targetWorkspaceSubdomain,
        fromSSO: true,
        isAuthEnabled: 'google',
      };

      if (
        this.environmentService.get('IS_MULTIWORKSPACE_ENABLED') &&
        targetWorkspaceSubdomain ===
          this.environmentService.get('DEFAULT_SUBDOMAIN')
      ) {
        const workspaceWithGoogleAuthActive =
          await this.workspaceRepository.findOne({
            where: {
              isGoogleAuthEnabled: true,
              workspaceUsers: {
                user: {
                  email,
                },
              },
            },
            relations: ['userWorkspaces', 'userWorkspaces.user'],
          });

        if (workspaceWithGoogleAuthActive) {
          signInUpParams.targetWorkspaceSubdomain =
            workspaceWithGoogleAuthActive.subdomain;
        }
      }

      const user = await this.authService.signInUp(signInUpParams);

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
