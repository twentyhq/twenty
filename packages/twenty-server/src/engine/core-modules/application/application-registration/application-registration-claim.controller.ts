import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { Request, Response } from 'express';
import { ApiPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';

import { ApplicationRegistrationClaimService } from 'src/engine/core-modules/application/application-registration/application-registration-claim.service';
import { ApplicationRegistrationClaimStateCookieService } from 'src/engine/core-modules/application/application-registration/services/application-registration-claim-state-cookie.service';
import { claimStateNonceMatches } from 'src/engine/core-modules/application/application-registration/utils/claim-state-nonce-matches.util';
import { resolveClaimCompletionRedirectUrl } from 'src/engine/core-modules/application/application-registration/utils/resolve-claim-completion-redirect-url.util';
import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { CustomException } from 'src/utils/custom-exception';
import { getRequestBaseUrl } from 'src/utils/get-request-base-url.util';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { GuardRedirectService } from 'src/engine/core-modules/guard-redirect/services/guard-redirect.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

type ClaimRedirectParams = {
  code: string | undefined;
  state: string | undefined;
  oauthError: string | undefined;
  req: Request;
  res: Response;
  canHandOverToCookieHost: boolean;
};

// GitHub OAuth callback of the trusted-publishers claim flow. Auth context
// travels in the signed state token, not in a session, hence the public
// endpoints. GitHub calls back on SERVER_URL while the nonce cookie lives on
// the host that served the settings page, so the callback hands over to that
// host when the two differ.
@Controller(ApiPath.ApplicationRegistrationClaim)
export class ApplicationRegistrationClaimController {
  constructor(
    private readonly applicationRegistrationClaimService: ApplicationRegistrationClaimService,
    private readonly claimStateCookieService: ApplicationRegistrationClaimStateCookieService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    private readonly guardRedirectService: GuardRedirectService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  @Get('github/callback')
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async githubCallback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Query('error') oauthError: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.completeClaimFromRedirect({
      code,
      state,
      oauthError,
      req,
      res,
      canHandOverToCookieHost: true,
    });
  }

  @Get('github/complete')
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async githubComplete(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.completeClaimFromRedirect({
      code,
      state,
      oauthError: undefined,
      req,
      res,
      canHandOverToCookieHost: false,
    });
  }

  private async completeClaimFromRedirect({
    code,
    state,
    oauthError,
    req,
    res,
    canHandOverToCookieHost,
  }: ClaimRedirectParams) {
    let workspace: WorkspaceEntity | null = null;
    const stateToken = state ?? '';

    try {
      const statePayload =
        await this.applicationRegistrationClaimService.verifyClaimState(
          stateToken,
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

      if (canHandOverToCookieHost && !isNonEmptyString(stateNonce)) {
        const completionUrl = resolveClaimCompletionRedirectUrl({
          cookieOrigin: statePayload.cookieOrigin,
          requestOrigin: getRequestBaseUrl(req),
          allowedOrigins: this.resolveClaimOrigins(workspace),
          code,
          state: stateToken,
        });

        if (isDefined(completionUrl)) {
          return res.redirect(completionUrl);
        }
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

  // Only origins the instance serves itself may receive the GitHub code.
  private resolveClaimOrigins(workspace: WorkspaceEntity | null): string[] {
    const serverUrl = this.twentyConfigService.get('SERVER_URL');

    if (workspace === null) {
      return [serverUrl];
    }

    const { customUrl, subdomainUrl } =
      this.workspaceDomainsService.getWorkspaceUrls(workspace);

    return [
      serverUrl,
      subdomainUrl,
      ...(isDefined(customUrl) ? [customUrl] : []),
    ];
  }
}
