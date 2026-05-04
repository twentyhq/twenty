import { Controller, Get, Logger, Query, Res, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type Response } from 'express';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ApplicationOAuthProviderFlowService } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider-flow.service';
import { ApplicationOAuthProviderExceptionCode } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider-exception-code.enum';
import { ApplicationOAuthProviderException } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider.exception';
import { ApplicationOAuthProviderService } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider.service';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { TransientTokenService } from 'src/engine/core-modules/auth/token/services/transient-token.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { GuardRedirectService } from 'src/engine/core-modules/guard-redirect/services/guard-redirect.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

@Controller('apps/oauth')
@UseGuards(PublicEndpointGuard, NoPermissionGuard)
export class ApplicationOAuthProviderController {
  private readonly logger = new Logger(ApplicationOAuthProviderController.name);

  constructor(
    private readonly oauthProviderService: ApplicationOAuthProviderService,
    private readonly oauthProviderFlowService: ApplicationOAuthProviderFlowService,
    private readonly transientTokenService: TransientTokenService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    private readonly guardRedirectService: GuardRedirectService,
    private readonly twentyConfigService: TwentyConfigService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
  ) {}

  // Public endpoint — the transient token carries workspace + user context
  // so we don't need a session cookie here.
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
    // Captured early so the error-redirect lands on the user's own
    // subdomain (different cookie domain otherwise = de-facto logout).
    let workspace: WorkspaceEntity | null = null;

    try {
      if (!applicationId || !providerName || !transientToken) {
        throw new ApplicationOAuthProviderException(
          'Missing required query parameters: applicationId, providerName, transientToken',
          ApplicationOAuthProviderExceptionCode.INVALID_REQUEST,
        );
      }

      if (
        visibility !== undefined &&
        visibility !== 'user' &&
        visibility !== 'workspace'
      ) {
        throw new ApplicationOAuthProviderException(
          `Invalid visibility "${visibility}" — must be 'user' or 'workspace'`,
          ApplicationOAuthProviderExceptionCode.INVALID_REQUEST,
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
        });

      if (!provider) {
        throw new ApplicationOAuthProviderException(
          `OAuth provider "${providerName}" not found for application ${applicationId}`,
          ApplicationOAuthProviderExceptionCode.PROVIDER_NOT_FOUND,
        );
      }

      if (provider.workspaceId !== workspaceId) {
        throw new ApplicationOAuthProviderException(
          'OAuth provider does not belong to the requesting workspace',
          ApplicationOAuthProviderExceptionCode.FORBIDDEN,
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
          applicationOAuthProvider: provider,
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
      // Without an explicit log, CustomException would 500 silently
      // (it doesn't extend HttpException, so Nest's default filter swallows it).
      this.logger.error(
        `OAuth authorize failed (applicationId=${applicationId}, providerName=${providerName}): ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );

      return this.redirectToError(res, error, workspace);
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

    if (errorParam) {
      return this.redirectToError(
        res,
        new Error(
          `OAuth provider returned error: ${errorParam}${errorDescription ? `: ${errorDescription}` : ''}`,
        ),
        workspace,
      );
    }

    if (!code || !state) {
      return this.redirectToError(
        res,
        new Error(
          'OAuth callback is missing the `code` or `state` query parameter',
        ),
        workspace,
      );
    }

    try {
      const { workspaceId, applicationId, redirectLocation } =
        await this.oauthProviderFlowService.completeAuthorizationFlow({
          code,
          state,
        });

      workspace = await this.workspaceRepository.findOneBy({
        id: workspaceId,
      });

      if (!workspace) {
        throw new ApplicationOAuthProviderException(
          `Workspace ${workspaceId} not found after OAuth callback`,
          ApplicationOAuthProviderExceptionCode.PROVIDER_NOT_FOUND,
        );
      }

      const pathname =
        redirectLocation ||
        getSettingsPath(SettingsPath.ApplicationDetail, { applicationId });

      const url = this.workspaceDomainsService.buildWorkspaceURL({
        workspace,
        pathname,
      });

      // Frontend tab list reads the URL hash to pick the active tab.
      if (!redirectLocation) {
        url.hash = 'settings';
      }

      return res.redirect(url.toString());
    } catch (error) {
      return this.redirectToError(res, error, workspace);
    }
  }

  private redirectToError(
    res: Response,
    error: unknown,
    workspace: WorkspaceEntity | null,
  ) {
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
        pathname: getSettingsPath(SettingsPath.Accounts),
      }),
    );
  }
}
