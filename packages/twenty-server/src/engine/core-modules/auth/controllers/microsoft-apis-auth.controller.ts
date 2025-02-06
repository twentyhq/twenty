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

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { MicrosoftAPIsOauthExchangeCodeForTokenGuard } from 'src/engine/core-modules/auth/guards/microsoft-apis-oauth-exchange-code-for-token.guard';
import { MicrosoftAPIsOauthRequestCodeGuard } from 'src/engine/core-modules/auth/guards/microsoft-apis-oauth-request-code.guard';
import { MicrosoftAPIsService } from 'src/engine/core-modules/auth/services/microsoft-apis.service';
import { TransientTokenService } from 'src/engine/core-modules/auth/token/services/transient-token.service';
import { MicrosoftAPIsRequest } from 'src/engine/core-modules/auth/types/microsoft-api-request.type';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { GuardRedirectService } from 'src/engine/core-modules/guard-redirect/services/guard-redirect.service';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Controller('auth/microsoft-apis')
@UseFilters(AuthRestApiExceptionFilter)
export class MicrosoftAPIsAuthController {
  constructor(
    private readonly microsoftAPIsService: MicrosoftAPIsService,
    private readonly transientTokenService: TransientTokenService,
    private readonly environmentService: EnvironmentService,
    private readonly domainManagerService: DomainManagerService,
    private readonly onboardingService: OnboardingService,
    private readonly guardRedirectService: GuardRedirectService,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
  ) {}

  @Get()
  @UseGuards(MicrosoftAPIsOauthRequestCodeGuard)
  async MicrosoftAuth() {
    // As this method is protected by Microsoft Auth guard, it will trigger Microsoft SSO flow
    return;
  }

  @Get('get-access-token')
  @UseGuards(MicrosoftAPIsOauthExchangeCodeForTokenGuard)
  async MicrosoftAuthGetAccessToken(
    @Req() req: MicrosoftAPIsRequest,
    @Res() res: Response,
  ) {
    let workspace: Workspace | null = null;

    try {
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
        await this.transientTokenService.verifyTransientToken(transientToken);

      if (!workspaceId) {
        throw new AuthException(
          'Workspace not found',
          AuthExceptionCode.WORKSPACE_NOT_FOUND,
        );
      }

      workspace = await this.workspaceRepository.findOneBy({
        id: workspaceId,
      });

      if (emails.length === 0) {
        throw new AuthException(
          'No email - Ask your Azure Entra Admin to add you one on top of your User Principal Name',
          AuthExceptionCode.USER_NOT_FOUND,
        );
      }

      const handle = emails[0].value;

      await this.microsoftAPIsService.refreshMicrosoftRefreshToken({
        handle,
        workspaceMemberId: workspaceMemberId,
        workspaceId: workspaceId,
        accessToken,
        refreshToken,
        calendarVisibility,
        messageVisibility,
      });

      if (userId) {
        await this.onboardingService.setOnboardingConnectAccountPending({
          userId,
          workspaceId,
          value: false,
        });
      }

      if (!workspace) {
        throw new AuthException(
          'Workspace not found',
          AuthExceptionCode.WORKSPACE_NOT_FOUND,
        );
      }

      return res.redirect(
        this.domainManagerService
          .buildWorkspaceURL({
            workspace,
            pathname: redirectLocation || '/settings/accounts',
          })
          .toString(),
      );
    } catch (err) {
      return res.redirect(
        this.guardRedirectService.getRedirectErrorUrlAndCaptureExceptions(
          err,
          workspace ?? {
            subdomain: this.environmentService.get('DEFAULT_SUBDOMAIN'),
          },
        ),
      );
    }
  }
}
