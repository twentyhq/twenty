import { type ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { GuardRedirectService } from 'src/engine/core-modules/guard-redirect/services/guard-redirect.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

const AADSTS650051_ERROR = 'AADSTS650051';
const MAX_MICROSOFT_AUTH_RETRIES = 1;

@Injectable()
export class MicrosoftOAuthGuard extends AuthGuard('microsoft') {
  private readonly logger = new Logger(MicrosoftOAuthGuard.name);

  constructor(
    private readonly guardRedirectService: GuardRedirectService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {
    super({
      prompt: 'select_account',
    });
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
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
      if (
        err instanceof Error &&
        err.message?.includes(AADSTS650051_ERROR) &&
        this.canRetryMicrosoftAuth(request)
      ) {
        this.logger.warn(
          'AADSTS650051: Microsoft service principal race condition, retrying auth flow',
        );

        const retryUrl = this.buildMicrosoftAuthRetryUrl(request);

        response.redirect(retryUrl);

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

  private canRetryMicrosoftAuth(request: {
    query: Record<string, unknown>;
  }): boolean {
    const retryCount = Number(request.query.msRetry) || 0;

    return retryCount < MAX_MICROSOFT_AUTH_RETRIES;
  }

  private buildMicrosoftAuthRetryUrl(request: {
    query: Record<string, unknown>;
  }): string {
    const retryCount = (Number(request.query.msRetry) || 0) + 1;

    let state: Record<string, unknown> = {};

    try {
      if (typeof request.query.state === 'string') {
        state = JSON.parse(request.query.state);
      }
    } catch {
      // state parsing failed, proceed with empty state
    }

    const params = new URLSearchParams();

    if (state.workspaceId) {
      params.set('workspaceId', String(state.workspaceId));
    }

    if (state.workspaceInviteHash) {
      params.set('workspaceInviteHash', String(state.workspaceInviteHash));
    }

    if (state.workspacePersonalInviteToken) {
      params.set(
        'workspacePersonalInviteToken',
        String(state.workspacePersonalInviteToken),
      );
    }

    if (state.action) {
      params.set('action', String(state.action));
    }

    if (state.locale) {
      params.set('locale', String(state.locale));
    }

    if (state.billingCheckoutSessionState) {
      params.set(
        'billingCheckoutSessionState',
        String(state.billingCheckoutSessionState),
      );
    }

    params.set('msRetry', String(retryCount));

    const serverUrl = this.twentyConfigService.get('SERVER_URL');

    return `${serverUrl}/auth/microsoft?${params.toString()}`;
  }
}
