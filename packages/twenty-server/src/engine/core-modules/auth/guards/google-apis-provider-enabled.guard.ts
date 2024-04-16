import {
  Injectable,
  CanActivate,
  NotFoundException,
  ExecutionContext,
} from '@nestjs/common';
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
import { getRequest } from 'src/utils/extract-request';

@Injectable()
export class GoogleAPIsProviderEnabledGuard implements CanActivate {
  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly tokenService: TokenService,
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (
      !this.environmentService.get('MESSAGING_PROVIDER_GMAIL_ENABLED') &&
      !this.environmentService.get('CALENDAR_PROVIDER_GOOGLE_ENABLED')
    ) {
      throw new NotFoundException('Google apis auth is not enabled');
    }

    const transientToken = getRequest(context)?.query?.transientToken;

    const scopeConfig: GoogleAPIScopeConfig = {
      isCalendarEnabled: false,
    };

    if (transientToken && typeof transientToken === 'string') {
      const { workspaceId } =
        await this.tokenService.verifyTransientToken(transientToken);

      const isCalendarEnabledFlag = await this.featureFlagRepository.findOneBy({
        workspaceId,
        key: FeatureFlagKeys.IsCalendarEnabled,
        value: true,
      });

      scopeConfig.isCalendarEnabled = !!isCalendarEnabledFlag?.value;
    }

    new GoogleAPIsStrategy(this.environmentService, scopeConfig);

    return true;
  }
}
