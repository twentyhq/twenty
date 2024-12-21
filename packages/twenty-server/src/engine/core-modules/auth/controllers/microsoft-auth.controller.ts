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

import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { MicrosoftOAuthGuard } from 'src/engine/core-modules/auth/guards/microsoft-oauth.guard';
import { MicrosoftProviderEnabledGuard } from 'src/engine/core-modules/auth/guards/microsoft-provider-enabled.guard';
import { AuthService } from 'src/engine/core-modules/auth/services/auth.service';
import { MicrosoftRequest } from 'src/engine/core-modules/auth/strategies/microsoft.auth.strategy';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/service/domain-manager.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Controller('auth/microsoft')
@UseFilters(AuthRestApiExceptionFilter)
export class MicrosoftAuthController {
  constructor(
    private readonly loginTokenService: LoginTokenService,
    private readonly authService: AuthService,
    private readonly domainManagerService: DomainManagerService,
    private readonly environmentService: EnvironmentService,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
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
      const signInUpParams = req.user;

      if (
        this.environmentService.get('IS_MULTIWORKSPACE_ENABLED') &&
        (signInUpParams.targetWorkspaceSubdomain ===
          this.environmentService.get('DEFAULT_SUBDOMAIN') ||
          !signInUpParams.targetWorkspaceSubdomain)
      ) {
        const workspaceWithGoogleAuthActive =
          await this.workspaceRepository.findOne({
            where: {
              isMicrosoftAuthEnabled: true,
              workspaceUsers: {
                user: {
                  email: signInUpParams.email,
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
        this.authService.computeRedirectURI(
          loginToken.token,
          workspace.subdomain,
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
