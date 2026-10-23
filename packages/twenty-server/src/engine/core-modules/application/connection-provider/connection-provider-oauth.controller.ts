import { Controller, Get, Logger, Query, Res, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type Response } from 'express';
import { ApiPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ConnectionProviderCustomFlowService } from 'src/engine/core-modules/application/connection-provider/connection-provider-custom-flow.service';
import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderFlowRedirectService } from 'src/engine/core-modules/application/connection-provider/connection-provider-flow-redirect.service';
import { ConnectionProviderOAuthFlowService } from 'src/engine/core-modules/application/connection-provider/connection-provider-oauth-flow.service';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { ConnectionProviderService } from 'src/engine/core-modules/application/connection-provider/connection-provider.service';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { TransientTokenService } from 'src/engine/core-modules/auth/token/services/transient-token.service';
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
    private readonly customFlowService: ConnectionProviderCustomFlowService,
    private readonly flowRedirectService: ConnectionProviderFlowRedirectService,
    private readonly transientTokenService: TransientTokenService,
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

      const authorizationArgs = {
        connectionProvider: provider,
        workspaceId,
        userId,
        userWorkspaceId: userWorkspace.id,
        reconnectingConnectedAccountId: reconnectingConnectedAccountId ?? null,
        redirectLocation: redirectLocation ?? null,
      };

      if (provider.type === 'custom') {
        const { authorizationUrl } =
          await this.customFlowService.startAuthorizationFlow(
            authorizationArgs,
          );

        return res.redirect(authorizationUrl);
      }

      const { authorizationUrl } =
        await this.oauthProviderFlowService.startAuthorizationFlow(
          authorizationArgs,
        );

      return res.redirect(authorizationUrl);
    } catch (error) {
      // CustomException doesn't extend HttpException, so Nest's filter would 500 it silently
      this.logger.error(
        `OAuth authorize failed (applicationId=${applicationId}, providerName=${providerName}): ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );

      return this.flowRedirectService.redirectToError({
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
      return this.flowRedirectService.redirectToErrorFromState({
        res,
        state,
        error: new Error(
          `OAuth provider returned error: ${errorParam}${errorDescription ? `: ${errorDescription}` : ''}`,
        ),
      });
    }

    if (!code || !state) {
      return this.flowRedirectService.redirectToErrorFromState({
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

      return await this.flowRedirectService.redirectToConnectedApplication({
        res,
        workspaceId,
        applicationId,
        redirectLocation,
      });
    } catch (error) {
      return this.flowRedirectService.redirectToErrorFromState({
        res,
        state,
        error,
      });
    }
  }
}
