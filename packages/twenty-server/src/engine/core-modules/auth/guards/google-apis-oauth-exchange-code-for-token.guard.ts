import { type ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { GoogleAPIsOauthExchangeCodeForTokenStrategy } from 'src/engine/core-modules/auth/strategies/google-apis-oauth-exchange-code-for-token.auth.strategy';
import { TransientTokenService } from 'src/engine/core-modules/auth/token/services/transient-token.service';
import { setRequestExtraParams } from 'src/engine/core-modules/auth/utils/google-apis-set-request-extra-params.util';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { GuardRedirectService } from 'src/engine/core-modules/guard-redirect/services/guard-redirect.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class GoogleAPIsOauthExchangeCodeForTokenGuard extends AuthGuard(
  'google-apis',
) {
  constructor(
    private readonly guardRedirectService: GuardRedirectService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly transientTokenService: TransientTokenService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    try {
      const request = context.switchToHttp().getRequest();
      const state = JSON.parse(request.query.state);

      if (
        !this.twentyConfigService.get('MESSAGING_PROVIDER_GMAIL_ENABLED') &&
        !this.twentyConfigService.get('CALENDAR_PROVIDER_GOOGLE_ENABLED')
      ) {
        throw new AuthException(
          'Google apis auth is not enabled',
          AuthExceptionCode.GOOGLE_API_AUTH_DISABLED,
        );
      }

      new GoogleAPIsOauthExchangeCodeForTokenStrategy(this.twentyConfigService);

      setRequestExtraParams(request, {
        transientToken: state.transientToken,
        redirectLocation: state.redirectLocation,
        calendarVisibility: state.calendarVisibility,
        messageVisibility: state.messageVisibility,
      });

      return (await super.canActivate(context)) as boolean;
    } catch (err) {
      if (err.status === 401) {
        const request = context.switchToHttp().getRequest();
        const state = JSON.parse(request.query.state);

        const workspace = await this.getWorkspaceFromTransientToken(
          state.transientToken,
        );

        const redirectErrorUrl =
          this.workspaceDomainsService.computeWorkspaceRedirectErrorUrl(
            'We cannot connect to your Google account, please try again with more permissions, or a valid account',
            {
              subdomain: workspace.subdomain,
              customDomain: workspace.customDomain,
              isCustomDomainEnabled: workspace.isCustomDomainEnabled ?? false,
            },
            '/settings/accounts',
          );

        context.switchToHttp().getResponse().redirect(redirectErrorUrl);

        return false;
      }

      this.guardRedirectService.dispatchErrorFromGuard(
        context,
        err,
        this.guardRedirectService.getSubdomainAndCustomDomainFromContext(
          context,
        ),
      );

      return false;
    }
  }

  private async getWorkspaceFromTransientToken(
    transientToken: string,
  ): Promise<WorkspaceEntity> {
    const { workspaceId } =
      await this.transientTokenService.verifyTransientToken(transientToken);

    const workspace = await this.workspaceRepository.findOneBy({
      id: workspaceId,
    });

    if (!workspace) {
      throw new AuthException(
        `Error extracting workspace from transientToken for Google APIs connect for ${workspaceId}`,
        AuthExceptionCode.WORKSPACE_NOT_FOUND,
      );
    }

    return workspace;
  }
}
