import {
  ThrottlerException,
  ThrottlerExceptionCode,
} from 'src/engine/core-modules/throttler/throttler.exception';
import { EnrichmentThrottleService } from 'src/engine/core-modules/company-enrichment/services/enrichment-throttle.service';

describe('EnrichmentThrottleService', () => {
  const consumeArguments = {
    throttleKey: 'company-enrichment:throttler:workspace-id',
    maxRequests: 10,
    windowMs: 60_000,
  };

  const buildService = () => {
    const throttlerService = { tokenBucketThrottleOrThrow: jest.fn() };
    const service = new EnrichmentThrottleService(throttlerService as never);

    return { service, throttlerService };
  };

  it('should consume one token from the bucket', async () => {
    const { service, throttlerService } = buildService();

    await expect(service.consumeToken(consumeArguments)).resolves.toBe(
      'consumed',
    );
    expect(throttlerService.tokenBucketThrottleOrThrow).toHaveBeenCalledWith(
      consumeArguments.throttleKey,
      1,
      consumeArguments.maxRequests,
      consumeArguments.windowMs,
    );
  });

  it('should report a reached limit instead of throwing', async () => {
    const { service, throttlerService } = buildService();

    throttlerService.tokenBucketThrottleOrThrow.mockRejectedValue(
      new ThrottlerException(
        'Limit reached',
        ThrottlerExceptionCode.LIMIT_REACHED,
      ),
    );

    await expect(service.consumeToken(consumeArguments)).resolves.toBe(
      'limitReached',
    );
  });

  it('should rethrow non throttler errors', async () => {
    const { service, throttlerService } = buildService();

    throttlerService.tokenBucketThrottleOrThrow.mockRejectedValue(
      new Error('redis down'),
    );

    await expect(service.consumeToken(consumeArguments)).rejects.toThrow(
      'redis down',
    );
  });
});
