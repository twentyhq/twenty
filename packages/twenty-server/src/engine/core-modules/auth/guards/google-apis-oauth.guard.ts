import {
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { TokenService } from 'src/engine/core-modules/auth/services/token.service';
import {
  GoogleAPIScopeConfig,
  GoogleAPIsStrategy,
} from 'src/engine/core-modules/auth/strategies/google-apis.auth.strategy';
import {
  FeatureFlagEntity,
  FeatureFlagKeys,
} from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';

@Injectable()
export class GoogleAPIsOauthGuard extends AuthGuard('google-apis') {
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
    const transientToken = request.query.transientToken;
    const redirectLocation = request.query.redirectLocation;
    const calendarVisibility = request.query.calendarVisibility;
    const messageVisibility = request.query.messageVisibility;

    if (
      !this.environmentService.get('MESSAGING_PROVIDER_GMAIL_ENABLED') &&
      !this.environmentService.get('CALENDAR_PROVIDER_GOOGLE_ENABLED')
    ) {
      throw new NotFoundException('Google apis auth is not enabled');
    }

    const { workspaceId } =
      await this.tokenService.verifyTransientToken(transientToken);

    const scopeConfig: GoogleAPIScopeConfig = {
      isCalendarEnabled: !!this.environmentService.get(
        'MESSAGING_PROVIDER_GMAIL_ENABLED',
      ),
      isProfileEmailsReadEnabled: !!(await this.featureFlagRepository.findOneBy(
        {
          workspaceId,
          key: FeatureFlagKeys.IsProfileEmailsReadEnabled,
          value: true,
        },
      )),
    };

    new GoogleAPIsStrategy(this.environmentService, scopeConfig);

    if (transientToken && typeof transientToken === 'string') {
      request.params.transientToken = transientToken;
    }

    if (redirectLocation && typeof redirectLocation === 'string') {
      request.params.redirectLocation = redirectLocation;
    }

    if (calendarVisibility && typeof calendarVisibility === 'string') {
      request.params.calendarVisibility = calendarVisibility;
    }

    if (messageVisibility && typeof messageVisibility === 'string') {
      request.params.messageVisibility = messageVisibility;
    }

    const activate = (await super.canActivate(context)) as boolean;

    return activate;
  }
}
