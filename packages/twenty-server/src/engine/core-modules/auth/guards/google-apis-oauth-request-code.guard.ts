import {
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { TokenService } from 'src/engine/core-modules/auth/services/token.service';
import { GoogleAPIScopeConfig } from 'src/engine/core-modules/auth/strategies/google-apis-oauth-exchange-code-for-token.auth.strategy';
import {
  FeatureFlagEntity,
  FeatureFlagKeys,
} from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { GoogleAPIsOauthRequestCodeStrategy } from 'src/engine/core-modules/auth/strategies/google-apis-oauth-request-code.auth.strategy';
import { setRequestExtraParams } from 'src/engine/core-modules/auth/utils/google-apis-set-request-extra-params.util';

@Injectable()
export class GoogleAPIsOauthRequestCodeGuard extends AuthGuard('google-apis') {
  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly tokenService: TokenService,
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
  ) {
    super({
      prompt: 'select_account',
    });
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    if (
      !this.environmentService.get('MESSAGING_PROVIDER_GMAIL_ENABLED') &&
      !this.environmentService.get('CALENDAR_PROVIDER_GOOGLE_ENABLED')
    ) {
      throw new NotFoundException('Google apis auth is not enabled');
    }

    const { workspaceId } = await this.tokenService.verifyTransientToken(
      request.query.transientToken,
    );

    const scopeConfig: GoogleAPIScopeConfig = {
      isMessagingAliasFetchingEnabled:
        !!(await this.featureFlagRepository.findOneBy({
          workspaceId,
          key: FeatureFlagKeys.IsMessagingAliasFetchingEnabled,
          value: true,
        })),
    };

    new GoogleAPIsOauthRequestCodeStrategy(
      this.environmentService,
      scopeConfig,
    );
    setRequestExtraParams(request, {
      transientToken: request.query.transientToken,
      redirectLocation: request.query.redirectLocation,
      calendarVisibility: request.query.calendarVisibility,
      messageVisibility: request.query.messageVisibility,
    });

    const activate = (await super.canActivate(context)) as boolean;

    return activate;
  }
}
