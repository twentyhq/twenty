import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class InternalMetadataTokenGuard implements CanActivate {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const expectedToken = this.twentyConfigService.get(
      'TWENTY_INTERNAL_METADATA_TOKEN',
    );

    if (!expectedToken) {
      throw new InternalServerErrorException(
        'TWENTY_INTERNAL_METADATA_TOKEN is not configured',
      );
    }

    const request = context.switchToHttp().getRequest();
    const providedToken = this.readBearerToken(request.headers.authorization);

    if (!providedToken) {
      return false;
    }

    const comparisonKey = randomBytes(32);
    const expectedDigest = createHmac('sha256', comparisonKey)
      .update(expectedToken)
      .digest();
    const providedDigest = createHmac('sha256', comparisonKey)
      .update(providedToken)
      .digest();

    return timingSafeEqual(expectedDigest, providedDigest);
  }

  private readBearerToken(headerValue: unknown): string | undefined {
    if (typeof headerValue !== 'string') {
      return undefined;
    }

    const [scheme, token] = headerValue.split(' ');

    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      return undefined;
    }

    return token;
  }
}
