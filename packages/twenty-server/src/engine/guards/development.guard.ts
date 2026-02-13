import { type CanActivate, Injectable } from '@nestjs/common';

import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class DevelopmentGuard implements CanActivate {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  canActivate(): boolean {
    const nodeEnv = this.twentyConfigService.get('NODE_ENV');

    if (
      nodeEnv !== NodeEnvironment.DEVELOPMENT &&
      nodeEnv !== NodeEnvironment.TEST
    ) {
      throw new Error(
        'This endpoint is only available in development or test environments',
      );
    }

    return true;
  }
}
