import {
  Controller,
  Get,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { Response } from 'express';
import {
  ApiPath,
  ConnectedAccountProvider,
  SettingsPath,
} from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { EmailForwardingProvisioningService } from 'src/engine/core-modules/email-forwarding/services/email-forwarding-provisioning.service';
import { GoogleAPIsOauthExchangeCodeForTokenGuard } from 'src/engine/core-modules/auth/guards/google-apis-oauth-exchange-code-for-token.guard';
import { GoogleAPIsOauthRequestCodeGuard } from 'src/engine/core-modules/auth/guards/google-apis-oauth-request-code.guard';
import { GoogleAPIsService } from 'src/engine/core-modules/auth/services/google-apis.service';
import { TransientTokenService } from 'src/engine/core-modules/auth/token/services/transient-token.service';
import { APIsOAuthRequest } from 'src/engine/core-modules/auth/types/apis-oauth-request.type';
import { parseRelativeUrl } from 'src/engine/core-modules/domain/domain-server-config/utils/parse-relative-url.util';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { GuardRedirectService } from 'src/engine/core-modules/guard-redirect/services/guard-redirect.service';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

@Controller(`${ApiPath.Auth}/google-apis`)
@UseFilters(AuthRestApiExceptionFilter)
export class GoogleAPIsAuthController {
  constructor(
    private readonly googleAPIsService: GoogleAPIsService,
    private readonly transientTokenService: TransientTokenService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly onboardingService: OnboardingService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    private readonly guardRedirectService: GuardRedirectService,
    private readonly emailForwardingProvisioningService: EmailForwardingProvisioningService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  @Get()
  @UseGuards(
    GoogleAPIsOauthRequestCodeGuard,
    PublicEndpointGuard,
    NoPermissionGuard,
  )
  async googleAuth() {
    // As this method is protected by Google Auth guard, it will trigger Google SSO flow
    return;
  }

  @Get('get-access-token')
  @UseGuards(
    GoogleAPIsOauthExchangeCodeForTokenGuard,
    PublicEndpointGuard,
    NoPermissionGuard,
  )
  async googleAuthGetAccessToken(
    @Req() req: APIsOAuthRequest,
    @Res() res: Response,
  ) {
    let workspace: WorkspaceEntity | null = null;

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
        skipMessageChannelConfiguration,
        emailForwardingMessageChannelId,
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

      if (isNonEmptyString(emailForwardingMessageChannelId)) {
        const failureReason =
          await this.emailForwardingProvisioningService.provisionFromOauthGrant(
            {
              messageChannelId: emailForwardingMessageChannelId,
              workspaceId,
              userId,
              provider: ConnectedAccountProvider.GOOGLE,
              accessToken,
            },
          );

        return res.redirect(
          this.buildEmailForwardingRedirectUrl({
            workspace,
            messageChannelId: emailForwardingMessageChannelId,
            failureReason,
          }),
        );
      }

      const handle = emails[0].value.toLowerCase();

      const connectedAccountId =
        await this.googleAPIsService.refreshGoogleRefreshToken({
          handle,
          userId,
          workspaceMemberId,
          workspaceId,
          accessToken,
          refreshToken,
          calendarVisibility,
          messageVisibility,
          skipMessageChannelConfiguration,
        });

      if (userId) {
        await this.onboardingService.completeOnboardingConnectAccountStep({
          userId,
          workspaceId,
        });
      }

      if (!workspace) {
        throw new AuthException(
          'Workspace not found',
          AuthExceptionCode.WORKSPACE_NOT_FOUND,
        );
      }

      const { pathname, searchParams, hash } = parseRelativeUrl(
        redirectLocation ||
          getSettingsPath(SettingsPath.AccountsConfiguration, {
            connectedAccountId,
          }),
      );

      const url = this.workspaceDomainsService.buildWorkspaceURL({
        workspace,
        pathname,
        searchParams,
        hash,
      });

      return res.redirect(url.toString());
    } catch (error) {
      return res.redirect(
        this.guardRedirectService.getRedirectErrorUrlAndCaptureExceptions({
          error,
          workspace: workspace ?? {
            subdomain: this.twentyConfigService.get('DEFAULT_SUBDOMAIN'),
            customDomain: null,
          },
          pathname: getSettingsPath(SettingsPath.Accounts),
        }),
      );
    }
  }

  private buildEmailForwardingRedirectUrl({
    workspace,
    messageChannelId,
    failureReason,
  }: {
    workspace: WorkspaceEntity | null;
    messageChannelId: string;
    failureReason: string | null;
  }): string {
    if (!isDefined(workspace)) {
      throw new AuthException(
        'Workspace not found',
        AuthExceptionCode.WORKSPACE_NOT_FOUND,
      );
    }

    const relativeUrl = isDefined(failureReason)
      ? getSettingsPath(
          SettingsPath.EmailGroupChannelForwarding,
          { messageChannelId },
          { forwardingError: failureReason },
        )
      : getSettingsPath(
          SettingsPath.EmailGroupChannelDetail,
          { messageChannelId },
          { forwardingProvisioned: 'true' },
        );

    const { pathname, searchParams, hash } = parseRelativeUrl(relativeUrl);

    return this.workspaceDomainsService
      .buildWorkspaceURL({ workspace, pathname, searchParams, hash })
      .toString();
  }
}
