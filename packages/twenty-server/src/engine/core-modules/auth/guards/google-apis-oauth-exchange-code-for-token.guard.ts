import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { TokenService } from 'src/engine/core-modules/auth/services/token.service';
import {
  GoogleAPIScopeConfig,
  GoogleAPIsOauthExchangeCodeForTokenStrategy,
} from 'src/engine/core-modules/auth/strategies/google-apis-oauth-exchange-code-for-token.auth.strategy';
import { setRequestExtraParams } from 'src/engine/core-modules/auth/utils/google-apis-set-request-extra-params.util';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';

@Injectable()
export class GoogleAPIsOauthExchangeCodeForTokenGuard extends AuthGuard(
  'google-apis',
) {
  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly tokenService: TokenService,
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const state = JSON.parse(request.query.state);

    if (
      !this.environmentService.get('MESSAGING_PROVIDER_GMAIL_ENABLED') &&
      !this.environmentService.get('CALENDAR_PROVIDER_GOOGLE_ENABLED')
    ) {
      throw new AuthException(
        'Google apis auth is not enabled',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    const { workspaceId } = await this.tokenService.verifyTransientToken(
      state.transientToken,
    );

    const scopeConfig: GoogleAPIScopeConfig = {
      isMessagingAliasFetchingEnabled:
        !!(await this.featureFlagRepository.findOneBy({
          workspaceId,
          key: FeatureFlagKey.IsMessagingAliasFetchingEnabled,
          value: true,
        })),
    };

    new GoogleAPIsOauthExchangeCodeForTokenStrategy(
      this.environmentService,
      scopeConfig,
    );

    setRequestExtraParams(request, {
      transientToken: state.transientToken,
      redirectLocation: state.redirectLocation,
      calendarVisibility: state.calendarVisibility,
      messageVisibility: state.messageVisibility,
    });

    return (await super.canActivate(context)) as boolean;
  }
}
