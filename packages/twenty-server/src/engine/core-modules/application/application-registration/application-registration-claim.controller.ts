import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { Request, Response } from 'express';
import { ApiPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

import { ApplicationRegistrationClaimService } from 'src/engine/core-modules/application/application-registration/application-registration-claim.service';
import { ApplicationRegistrationClaimStateCookieService } from 'src/engine/core-modules/application/application-registration/services/application-registration-claim-state-cookie.service';
import { claimStateNonceMatches } from 'src/engine/core-modules/application/application-registration/utils/claim-state-nonce-matches.util';
import { isClaimStartOriginAllowed } from 'src/engine/core-modules/application/application-registration/utils/is-claim-start-origin-allowed.util';
import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { CustomException } from 'src/utils/custom-exception';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { GuardRedirectService } from 'src/engine/core-modules/guard-redirect/services/guard-redirect.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { resolveAllowedCredentialedOrigins } from 'src/engine/core-modules/user-session/utils/resolve-allowed-credentialed-origins.util';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

// GitHub OAuth callback of the trusted-publishers claim flow. Auth context
// travels in the signed state token, not in a session, hence the public
// endpoint.
@Controller(ApiPath.ApplicationRegistrationClaim)
export class ApplicationRegistrationClaimController {
  constructor(
    private readonly applicationRegistrationClaimService: ApplicationRegistrationClaimService,
    private readonly claimStateCookieService: ApplicationRegistrationClaimStateCookieService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    private readonly guardRedirectService: GuardRedirectService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  @Post('github/start')
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async githubStart(
    @Query('token') token: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    let workspace: WorkspaceEntity | null = null;

    try {
      const startPayload =
        await this.applicationRegistrationClaimService.verifyClaimStartToken(
          token ?? '',
        );

      workspace =
        await this.applicationRegistrationClaimService.findWorkspaceById(
          startPayload.workspaceId,
        );

      if (
        !isClaimStartOriginAllowed({
          origin: req.headers.origin,
          allowedOrigins: this.resolveClaimStartOrigins(workspace),
        })
      ) {
        throw new ApplicationRegistrationException(
          'Claim start request does not come from an origin this instance serves',
          ApplicationRegistrationExceptionCode.CLAIM_ORIGIN_NOT_ALLOWED,
        );
      }

      const authorizationUrl =
        await this.applicationRegistrationClaimService.buildGithubAuthorizationUrl(
          { startPayload, response: res },
        );

      return res.redirect(authorizationUrl);
    } catch (error) {
      return this.redirectWithClaimError({ error, workspace, res });
    }
  }

  @Get('github/callback')
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async githubCallback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Query('error') oauthError: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    let workspace: WorkspaceEntity | null = null;

    try {
      const statePayload =
        await this.applicationRegistrationClaimService.verifyClaimState(
          state ?? '',
        );

      workspace =
        await this.applicationRegistrationClaimService.findWorkspaceById(
          statePayload.workspaceId,
        );

      const stateNonce = this.claimStateCookieService.extractNonceFromRequest(
        req,
        statePayload.applicationRegistrationId,
      );

      if (
        isNonEmptyString(stateNonce) &&
        isNonEmptyString(statePayload.nonceHash) &&
        claimStateNonceMatches({
          nonce: stateNonce,
          expectedNonceHash: statePayload.nonceHash,
        })
      ) {
        this.claimStateCookieService.clearNonceCookie(
          res,
          statePayload.applicationRegistrationId,
        );
      }

      if (oauthError !== undefined || code === undefined) {
        throw new ApplicationRegistrationException(
          'GitHub authorization was denied',
          ApplicationRegistrationExceptionCode.GITHUB_AUTH_FAILED,
        );
      }

      await this.applicationRegistrationClaimService.completeGithubClaim({
        statePayload,
        code,
        stateNonce,
      });

      if (workspace === null) {
        throw new Error('Workspace not found');
      }

      const url = this.workspaceDomainsService.buildWorkspaceURL({
        workspace,
        pathname: getSettingsPath(SettingsPath.Applications),
      });

      url.hash = 'developer';

      return res.redirect(url.toString());
    } catch (error) {
      return this.redirectWithClaimError({ error, workspace, res });
    }
  }

  private resolveClaimStartOrigins(
    workspace: WorkspaceEntity | null,
  ): string[] {
    const servedOrigins = [
      ...resolveAllowedCredentialedOrigins(this.twentyConfigService),
    ];

    if (workspace === null) {
      return servedOrigins;
    }

    return [
      ...servedOrigins,
      this.workspaceDomainsService.getWorkspaceUrls(workspace).subdomainUrl,
    ];
  }

  private redirectWithClaimError({
    error,
    workspace,
    res,
  }: {
    error: Error;
    workspace: WorkspaceEntity | null;
    res: Response;
  }) {
    const claimErrorCode =
      error instanceof CustomException ? error.code : 'CLAIM_FAILED';

    if (workspace !== null) {
      const url = this.workspaceDomainsService.buildWorkspaceURL({
        workspace,
        pathname: getSettingsPath(SettingsPath.Applications),
      });

      url.searchParams.set('claimErrorCode', claimErrorCode);
      url.hash = 'developer';

      return res.redirect(url.toString());
    }

    return res.redirect(
      this.guardRedirectService.getRedirectErrorUrlAndCaptureExceptions({
        error,
        workspace: {
          subdomain: this.twentyConfigService.get('DEFAULT_SUBDOMAIN'),
          customDomain: null,
        },
        pathname: getSettingsPath(SettingsPath.Applications),
      }),
    );
  }
}
