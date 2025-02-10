import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { MicrosoftAPIsOauthRequestCodeStrategy } from 'src/engine/core-modules/auth/strategies/microsoft-apis-oauth-request-code.auth.strategy';
import { TransientTokenService } from 'src/engine/core-modules/auth/token/services/transient-token.service';
import { setRequestExtraParams } from 'src/engine/core-modules/auth/utils/google-apis-set-request-extra-params.util';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { GuardRedirectService } from 'src/engine/core-modules/guard-redirect/services/guard-redirect.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class MicrosoftAPIsOauthRequestCodeGuard extends AuthGuard(
  'microsoft-apis',
) {
  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly transientTokenService: TransientTokenService,
    private readonly guardRedirectService: GuardRedirectService,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
  ) {
    super({
      prompt: 'select_account',
    });
  }

  async canActivate(context: ExecutionContext) {
    let workspace: Workspace | null = null;

    try {
      if (
        !this.environmentService.get('MESSAGING_PROVIDER_MICROSOFT_ENABLED') &&
        !this.environmentService.get('CALENDAR_PROVIDER_MICROSOFT_ENABLED')
      ) {
        throw new AuthException(
          'Microsoft apis auth is not enabled',
          AuthExceptionCode.MICROSOFT_API_AUTH_DISABLED,
        );
      }

      const request = context.switchToHttp().getRequest();

      const { workspaceId } =
        await this.transientTokenService.verifyTransientToken(
          request.query.transientToken,
        );

      workspace = await this.workspaceRepository.findOneBy({
        id: workspaceId,
      });

      new MicrosoftAPIsOauthRequestCodeStrategy(this.environmentService);
      setRequestExtraParams(request, {
        transientToken: request.query.transientToken,
        redirectLocation: request.query.redirectLocation,
        calendarVisibility: request.query.calendarVisibility,
        messageVisibility: request.query.messageVisibility,
        loginHint: request.query.loginHint,
      });

      return (await super.canActivate(context)) as boolean;
    } catch (err) {
      this.guardRedirectService.dispatchErrorFromGuard(
        context,
        err,
        this.guardRedirectService.getSubdomainAndCustomDomainFromWorkspace(
          workspace,
        ),
      );

      return false;
    }
  }
}
