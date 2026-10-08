import { Controller, Get, Logger, Query, Res, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type Response } from 'express';
import { ApiPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ConnectionProviderOAuthFlowService } from 'src/engine/core-modules/application/connection-provider/connection-provider-oauth-flow.service';
import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { ConnectionProviderService } from 'src/engine/core-modules/application/connection-provider/connection-provider.service';
import { getAppPreferencesOAuthRedirectPath } from 'src/engine/core-modules/application/connection-provider/utils/get-app-preferences-oauth-redirect-path.util';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { TransientTokenService } from 'src/engine/core-modules/auth/token/services/transient-token.service';
import { parseRelativeUrl } from 'src/engine/core-modules/domain/domain-server-config/utils/parse-relative-url.util';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { GuardRedirectService } from 'src/engine/core-modules/guard-redirect/services/guard-redirect.service';
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
    @Query('visibility') visibility: string | undefined,
    @Query('reconnectingConnectedAccountId')
    reconnectingConnectedAccountId: string | undefined,
    @Query('redirectLocation') redirectLocation: string | undefined,
    @Res() res: Response,
  ) {
    // Captured early so error redirects land on the user's subdomain (another cookie domain logs them out)
    let workspace: WorkspaceEntity | null = null;
    let personalRedirectPath: string | null = null;

    try {
      if (!applicationId || !providerName || !transientToken) {
        throw new ConnectionProviderException(
          'Missing required query parameters: applicationId, providerName, transientToken',
          ConnectionProviderExceptionCode.INVALID_REQUEST,
        );
      }

      if (
        visibility !== undefined &&
        visibility !== 'user' &&
        visibility !== 'workspace'
      ) {
        throw new ConnectionProviderException(
          `Invalid visibility "${visibility}" — must be 'user' or 'workspace'`,
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

      const userWorkspace = await this.userWorkspaceRepository.findOne({
        where: { userId, workspaceId },
      });

      if (!isDefined(userWorkspace)) {
        throw new AuthException(
          `UserWorkspace not found for user ${userId} in workspace ${workspaceId}`,
          AuthExceptionCode.WORKSPACE_NOT_FOUND,
        );
      }

      personalRedirectPath = getAppPreferencesOAuthRedirectPath({
        applicationId,
        redirectLocation,
        reconnectingConnectedAccountId,
      });

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

      const { authorizationUrl } =
        await this.oauthProviderFlowService.startAuthorizationFlow({
          connectionProvider: provider,
          workspaceId,
          userId,
          userWorkspaceId: userWorkspace.id,
          visibility:
            (visibility as 'user' | 'workspace' | undefined) ?? 'user',
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
        pathname: personalRedirectPath ?? undefined,
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
    let workspace: WorkspaceEntity | null = null;
    let personalRedirectPath: string | null = null;

    try {
      const statePayload =
        await this.oauthProviderFlowService.verifyStateOrThrow({ state });

      workspace = await this.workspaceRepository.findOneBy({
        id: statePayload.workspaceId,
      });

      if (!workspace) {
        throw new ConnectionProviderException(
          `Workspace ${statePayload.workspaceId} not found for OAuth callback`,
          ConnectionProviderExceptionCode.PROVIDER_NOT_FOUND,
        );
      }

      if (isDefined(statePayload.applicationId)) {
        personalRedirectPath = getAppPreferencesOAuthRedirectPath({
          applicationId: statePayload.applicationId,
          redirectLocation: statePayload.redirectLocation,
          reconnectingConnectedAccountId:
            statePayload.reconnectingConnectedAccountId,
        });
      }

      if (errorParam) {
        throw new ConnectionProviderException(
          `OAuth provider returned error: ${errorParam}${errorDescription ? `: ${errorDescription}` : ''}`,
          ConnectionProviderExceptionCode.INVALID_REQUEST,
        );
      }

      if (!code) {
        throw new ConnectionProviderException(
          'OAuth callback is missing the `code` query parameter',
          ConnectionProviderExceptionCode.INVALID_REQUEST,
        );
      }

      const { applicationId, redirectLocation } =
        await this.oauthProviderFlowService.completeAuthorizationFlow({
          code,
          state,
        });

      const { pathname, searchParams, hash } = parseRelativeUrl(
        redirectLocation ||
          getSettingsPath(SettingsPath.ApplicationDetail, { applicationId }),
      );

      const url = this.workspaceDomainsService.buildWorkspaceURL({
        workspace,
        pathname,
        searchParams,
        hash,
      });

      // Frontend tab list reads the URL hash to pick the active tab.
      if (!redirectLocation) {
        url.hash = 'settings';
      }

      return res.redirect(url.toString());
    } catch (error) {
      return this.redirectToError({
        res,
        error,
        workspace,
        pathname: personalRedirectPath ?? undefined,
      });
    }
  }

  private redirectToError({
    res,
    error,
    workspace,
    pathname = getSettingsPath(SettingsPath.Accounts),
  }: {
    res: Response;
    error: unknown;
    workspace: WorkspaceEntity | null;
    pathname?: string;
  }) {
    return res.redirect(
      this.guardRedirectService.getRedirectErrorUrlAndCaptureExceptions({
        error: error instanceof Error ? error : new Error(String(error)),
        workspace: {
          id: workspace?.id,
          subdomain:
            workspace?.subdomain ??
            this.twentyConfigService.get('DEFAULT_SUBDOMAIN'),
          customDomain: workspace?.customDomain ?? null,
        },
        pathname,
      }),
    );
  }
}
