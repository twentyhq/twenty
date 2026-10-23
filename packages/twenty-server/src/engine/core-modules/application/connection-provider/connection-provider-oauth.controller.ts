import { Controller, Get, Logger, Query, Res, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { type Response } from 'express';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { ApiPath, SettingsPath } from 'twenty-shared/types';
import {
  getSettingsPath,
  isDefined,
  isSafeInternalPath,
} from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ConnectionProviderOAuthFlowService } from 'src/engine/core-modules/application/connection-provider/connection-provider-oauth-flow.service';
import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { ConnectionProviderService } from 'src/engine/core-modules/application/connection-provider/connection-provider.service';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { TransientTokenService } from 'src/engine/core-modules/auth/token/services/transient-token.service';
import { parseRelativeUrl } from 'src/engine/core-modules/domain/domain-server-config/utils/parse-relative-url.util';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { GuardRedirectService } from 'src/engine/core-modules/guard-redirect/services/guard-redirect.service';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

@Controller(`${ApiPath.Auth}/apps`)
@UseGuards(PublicEndpointGuard, NoPermissionGuard)
export class ConnectionProviderOAuthController {
  private readonly logger = new Logger(ConnectionProviderOAuthController.name);

  constructor(
    private readonly oauthProviderService: ConnectionProviderService,
    private readonly oauthProviderFlowService: ConnectionProviderOAuthFlowService,
    private readonly transientTokenService: TransientTokenService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    private readonly guardRedirectService: GuardRedirectService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly i18nService: I18nService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
  ) {}

  // Public: the transient token carries workspace and user context
  @Get('authorize')
  async authorize(
    @Query('applicationId') applicationId: string,
    @Query('providerName') providerName: string,
    @Query('transientToken') transientToken: string,
    @Query('reconnectingConnectedAccountId')
    reconnectingConnectedAccountId: string | undefined,
    @Query('redirectLocation') redirectLocation: string | undefined,
    @Res() res: Response,
  ) {
    // Captured early so error redirects land on the user's subdomain (another cookie domain logs them out)
    let workspace: WorkspaceEntity | null = null;

    try {
      if (!applicationId || !providerName || !transientToken) {
        throw new ConnectionProviderException(
          'Missing required query parameters: applicationId, providerName, transientToken',
          ConnectionProviderExceptionCode.INVALID_REQUEST,
        );
      }

      const { userId, workspaceId } =
        await this.transientTokenService.verifyTransientToken(transientToken);

      if (!workspaceId || !userId) {
        throw new AuthException(
          'Workspace or user not found in transient token',
          AuthExceptionCode.WORKSPACE_NOT_FOUND,
        );
      }

      workspace = await this.workspaceRepository.findOneBy({
        id: workspaceId,
      });

      if (!workspace) {
        throw new AuthException(
          `Workspace ${workspaceId} not found`,
          AuthExceptionCode.WORKSPACE_NOT_FOUND,
        );
      }

      const provider =
        await this.oauthProviderService.findOneByApplicationAndName({
          applicationId,
          name: providerName,
          workspaceId,
        });

      if (!provider) {
        throw new ConnectionProviderException(
          `OAuth provider "${providerName}" not found for application ${applicationId}`,
          ConnectionProviderExceptionCode.PROVIDER_NOT_FOUND,
        );
      }

      const userWorkspace = await this.userWorkspaceRepository.findOne({
        where: { userId, workspaceId },
      });

      if (!isDefined(userWorkspace)) {
        throw new AuthException(
          `UserWorkspace not found for user ${userId} in workspace ${workspaceId}`,
          AuthExceptionCode.WORKSPACE_NOT_FOUND,
        );
      }

      const { authorizationUrl } =
        await this.oauthProviderFlowService.startAuthorizationFlow({
          connectionProvider: provider,
          workspaceId,
          userId,
          userWorkspaceId: userWorkspace.id,
          reconnectingConnectedAccountId:
            reconnectingConnectedAccountId ?? null,
          redirectLocation: redirectLocation ?? null,
        });

      return res.redirect(authorizationUrl);
    } catch (error) {
      // CustomException doesn't extend HttpException, so Nest's filter would 500 it silently
      this.logger.error(
        `OAuth authorize failed (applicationId=${applicationId}, providerName=${providerName}): ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );

      return this.redirectToError({
        res,
        error,
        workspace,
        redirectLocation: redirectLocation ?? null,
      });
    }
  }

  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') errorParam: string | undefined,
    @Query('error_description') errorDescription: string | undefined,
    @Res() res: Response,
  ) {
    if (errorParam) {
      return this.redirectToErrorFromState({
        res,
        state,
        error: new Error(
          `OAuth provider returned error: ${errorParam}${errorDescription ? `: ${errorDescription}` : ''}`,
        ),
      });
    }

    if (!code || !state) {
      return this.redirectToErrorFromState({
        res,
        state,
        error: new Error(
          'OAuth callback is missing the `code` or `state` query parameter',
        ),
      });
    }

    try {
      const { workspaceId, applicationId, redirectLocation } =
        await this.oauthProviderFlowService.completeAuthorizationFlow({
          code,
          state,
        });

      const workspace = await this.workspaceRepository.findOneBy({
        id: workspaceId,
      });

      if (!workspace) {
        throw new ConnectionProviderException(
          `Workspace ${workspaceId} not found after OAuth callback`,
          ConnectionProviderExceptionCode.PROVIDER_NOT_FOUND,
        );
      }

      const hasRedirectLocation = isNonEmptyString(redirectLocation);

      const { pathname, searchParams, hash } = this.parseRedirectLocation({
        redirectLocation,
        fallbackPathname: getSettingsPath(SettingsPath.ApplicationDetail, {
          applicationId,
        }),
      });

      const url = this.workspaceDomainsService.buildWorkspaceURL({
        workspace,
        pathname,
        searchParams,
        hash,
      });

      // Frontend tab list reads the URL hash to pick the active tab.
      if (!hasRedirectLocation) {
        url.hash = 'settings';
      }

      return res.redirect(url.toString());
    } catch (error) {
      return this.redirectToErrorFromState({ res, state, error });
    }
  }

  private async redirectToErrorFromState({
    res,
    state,
    error,
  }: {
    res: Response;
    state: string | undefined;
    error: unknown;
  }) {
    const errorRedirectTarget = isNonEmptyString(state)
      ? await this.oauthProviderFlowService.findErrorRedirectTargetFromState(
          state,
        )
      : null;

    const workspace = isDefined(errorRedirectTarget)
      ? await this.workspaceRepository.findOneBy({
          id: errorRedirectTarget.workspaceId,
        })
      : null;

    return this.redirectToError({
      res,
      error,
      workspace,
      redirectLocation: errorRedirectTarget?.redirectLocation ?? null,
    });
  }

  private parseRedirectLocation({
    redirectLocation,
    fallbackPathname,
  }: {
    redirectLocation: string | null | undefined;
    fallbackPathname: string;
  }) {
    return parseRelativeUrl(
      isDefined(redirectLocation) && isSafeInternalPath(redirectLocation)
        ? redirectLocation
        : fallbackPathname,
    );
  }

  private redirectToError({
    res,
    error,
    workspace,
    redirectLocation,
  }: {
    res: Response;
    error: unknown;
    workspace: WorkspaceEntity | null;
    redirectLocation: string | null;
  }) {
    const { pathname, searchParams, hash } = this.parseRedirectLocation({
      redirectLocation,
      fallbackPathname: getSettingsPath(SettingsPath.Accounts),
    });

    return res.redirect(
      this.guardRedirectService.getRedirectErrorUrlAndCaptureExceptions({
        error: error instanceof Error ? error : new Error(String(error)),
        workspace: {
          id: workspace?.id,
          subdomain:
            workspace?.subdomain ??
            this.twentyConfigService.get('DEFAULT_SUBDOMAIN'),
          customDomain: workspace?.customDomain ?? null,
          isCustomDomainEnabled: workspace?.isCustomDomainEnabled ?? false,
        },
        pathname,
        searchParams,
        hash,
        errorMessage: this.getTokenExchangeFailureMessage(error),
      }),
    );
  }

  private getTokenExchangeFailureMessage(error: unknown): string | undefined {
    if (
      !(error instanceof ConnectionProviderException) ||
      error.code !== ConnectionProviderExceptionCode.TOKEN_EXCHANGE_FAILED
    ) {
      return undefined;
    }

    return this.i18nService
      .getI18nInstance(SOURCE_LOCALE)
      ._(error.userFriendlyMessage);
  }
}
