import {
  Injectable,
  CanActivate,
  NotFoundException,
  ExecutionContext,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { TokenService } from 'src/engine/core-modules/auth/services/token.service';
import { GoogleAPIsStrategy } from 'src/engine/core-modules/auth/strategies/google-apis.auth.strategy';
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

    const { workspaceId } = await this.tokenService.verifyTransientToken(
      getRequest(context)?.query?.transientToken ?? '',
    );

    const isCalendarEnabledFlag = await this.featureFlagRepository.findOneBy({
      workspaceId,
      key: FeatureFlagKeys.IsCalendarEnabled,
      value: true,
    });

    const isCalendarEnabled = !!isCalendarEnabledFlag?.value;

    new GoogleAPIsStrategy(this.environmentService, {
      isCalendarEnabled,
    });

    return true;
  }
}
