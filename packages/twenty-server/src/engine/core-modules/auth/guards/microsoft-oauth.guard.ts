import { type ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';

import { type Request } from 'express';
import { parseJson } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { MICROSOFT_OAUTH_MAX_RETRY_ATTEMPTS } from 'src/engine/core-modules/auth/constants/microsoft-oauth-max-retry-attempts.constants';
import { type SocialSSOState } from 'src/engine/core-modules/auth/types/social-sso-state.type';
import { isMicrosoftOAuthTransientError } from 'src/engine/core-modules/auth/utils/is-microsoft-oauth-transient-error.util';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { GuardRedirectService } from 'src/engine/core-modules/guard-redirect/services/guard-redirect.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

type SocialSSOStateWithRetry = SocialSSOState & {
  oauthRetryCount?: number;
};

@Injectable()
export class MicrosoftOAuthGuard extends AuthGuard('microsoft') {
  constructor(
    private readonly guardRedirectService: GuardRedirectService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
  ) {
    super({
      prompt: 'select_account',
    });
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    let workspace: WorkspaceEntity | null = null;

    try {
      if (
        request.query.workspaceId &&
        typeof request.query.workspaceId === 'string'
      ) {
        request.params.workspaceId = request.query.workspaceId;
        workspace = await this.workspaceRepository.findOneBy({
          id: request.query.workspaceId,
        });
      }

      return (await super.canActivate(context)) as boolean;
    } catch (err) {
      if (this.handleTransientMicrosoftOAuthError(context, request, err)) {
        return false;
      }

      this.guardRedirectService.dispatchErrorFromGuard(
        context,
        err,
        this.workspaceDomainsService.getSubdomainAndCustomDomainFromWorkspaceFallbackOnDefaultSubdomain(
          workspace,
        ),
      );

      return false;
    }
  }

  private handleTransientMicrosoftOAuthError(
    context: ExecutionContext,
    request: Request,
    error: unknown,
  ): boolean {
    if (!isMicrosoftOAuthTransientError(error)) {
      return false;
    }

    const state = parseJson<SocialSSOStateWithRetry>(
      request.query.state as string,
    );

    const oauthRetryCount = Math.max(0, Number(state?.oauthRetryCount) || 0);

    if (oauthRetryCount >= MICROSOFT_OAUTH_MAX_RETRY_ATTEMPTS) {
      return false;
    }

    const url = new URL('/auth/microsoft', 'http://localhost');

    url.searchParams.set('oauthRetryCount', String(oauthRetryCount + 1));

    if (state) {
      for (const [key, value] of Object.entries(state)) {
        if (key !== 'oauthRetryCount' && value != null) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    context
      .switchToHttp()
      .getResponse()
      .redirect(url.pathname + url.search);

    return true;
  }
}
