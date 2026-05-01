import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type Response } from 'express';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { isDefined } from 'twenty-shared/utils';
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

  // Initiated from the frontend after the user clicks "Connect <provider>".
  // The frontend mints a transient token (encoding workspace + user context)
  // so this endpoint can be public yet still scoped to the right workspace.
  @Get('authorize')
  async authorize(
    @Query('applicationId') applicationId: string,
    @Query('providerName') providerName: string,
    @Query('transientToken') transientToken: string,
    @Query('redirectLocation') redirectLocation: string | undefined,
    @Res() res: Response,
  ) {
    if (!applicationId || !providerName || !transientToken) {
      throw new ApplicationOAuthProviderException(
        'Missing required query parameters: applicationId, providerName, transientToken',
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
        redirectLocation: redirectLocation ?? null,
      });

    return res.redirect(authorizationUrl);
  }

  // The OAuth provider redirects back here with `code` + `state`. The state
  // is a signed JWT we minted in the authorize step — it carries workspace
  // identity so this single, workspace-agnostic URL can route the user back
  // to their workspace subdomain after the token exchange.
  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') errorParam: string | undefined,
    @Query('error_description') errorDescription: string | undefined,
    @Res() res: Response,
  ) {
    if (errorParam) {
      return this.redirectToError(
        res,
        new Error(
          `OAuth provider returned error: ${errorParam}${errorDescription ? `: ${errorDescription}` : ''}`,
        ),
      );
    }

    if (!code || !state) {
      return this.redirectToError(
        res,
        new Error(
          'OAuth callback is missing the `code` or `state` query parameter',
        ),
      );
    }

    try {
      const { connectedAccountId, workspaceId, redirectLocation } =
        await this.oauthProviderFlowService.completeAuthorizationFlow({
          code,
          state,
        });

      const workspace = await this.workspaceRepository.findOneBy({
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
        getSettingsPath(SettingsPath.AccountsConfiguration, {
          connectedAccountId,
        });

      const url = this.workspaceDomainsService.buildWorkspaceURL({
        workspace,
        pathname,
      });

      return res.redirect(url.toString());
    } catch (error) {
      return this.redirectToError(res, error);
    }
  }

  private redirectToError(res: Response, error: unknown) {
    return res.redirect(
      this.guardRedirectService.getRedirectErrorUrlAndCaptureExceptions({
        error: error instanceof Error ? error : new Error(String(error)),
        workspace: {
          subdomain: this.twentyConfigService.get('DEFAULT_SUBDOMAIN'),
          customDomain: null,
        },
        pathname: getSettingsPath(SettingsPath.Accounts),
      }),
    );
  }
}
