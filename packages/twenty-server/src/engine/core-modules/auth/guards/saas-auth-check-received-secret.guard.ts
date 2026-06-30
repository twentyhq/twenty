import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { timingSafeEqual } from 'crypto';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class SaasAuthCheckReceivedSecretGuard implements CanActivate {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const secret = this.twentyConfigService.get(
      'SAAS_AUTH_CHECK_RECEIVED_SECRET',
    );

    if (!secret) {
      throw new InternalServerErrorException(
        'SAAS_AUTH_CHECK_RECEIVED_SECRET is not configured',
      );
    }

    try {
      const request = context.switchToHttp().getRequest();
      const headerValue = request.headers['x-saas-auth-secret'];

      if (typeof headerValue !== 'string' || headerValue.length === 0) {
        return false;
      }

      const headerBuffer = Buffer.from(headerValue);
      const secretBuffer = Buffer.from(secret);

      if (headerBuffer.length !== secretBuffer.length) {
        return false;
      }

      return timingSafeEqual(headerBuffer, secretBuffer);
    } catch {
      return false;
    }
  }
}
