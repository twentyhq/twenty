import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { timingSafeEqual } from 'crypto';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class HealthzSecretGuard implements CanActivate {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const healthzSecret = this.twentyConfigService.get('HEALTHZ_SECRET');

    if (!healthzSecret) {
      throw new InternalServerErrorException(
        'HEALTHZ_SECRET environment variable is not configured',
      );
    }

    const request = context.switchToHttp().getRequest();
    const headerSecret = request.headers['x-healthz-secret'] as
      | string
      | undefined;

    if (!headerSecret) {
      throw new ForbiddenException('Missing X-Healthz-Secret header');
    }

    const isValid =
      headerSecret.length === healthzSecret.length &&
      timingSafeEqual(Buffer.from(headerSecret), Buffer.from(healthzSecret));

    if (!isValid) {
      throw new ForbiddenException('Invalid X-Healthz-Secret header');
    }

    return true;
  }
}
