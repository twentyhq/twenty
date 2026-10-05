import { Injectable } from '@nestjs/common';

import {
  ThrottlerException,
  ThrottlerExceptionCode,
} from 'src/engine/core-modules/throttler/throttler.exception';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';

@Injectable()
export class EnrichmentThrottleService {
  constructor(private readonly throttlerService: ThrottlerService) {}

  async consumeToken({
    throttleKey,
    maxRequests,
    windowMs,
  }: {
    throttleKey: string;
    maxRequests: number;
    windowMs: number;
  }): Promise<'consumed' | 'limitReached'> {
    try {
      await this.throttlerService.tokenBucketThrottleOrThrow(
        throttleKey,
        1,
        maxRequests,
        windowMs,
      );

      return 'consumed';
    } catch (error) {
      if (
        error instanceof ThrottlerException &&
        error.code === ThrottlerExceptionCode.LIMIT_REACHED
      ) {
        return 'limitReached';
      }

      throw error;
    }
  }
}
