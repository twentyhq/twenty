import { type ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

// Logic functions and HTTP requests spend one bucket: an HTTP step can do nothing a logic function cannot.
export const consumeLogicFunctionExecutionToken = ({
  throttlerService,
  twentyConfigService,
  workspaceId,
}: {
  throttlerService: ThrottlerService;
  twentyConfigService: TwentyConfigService;
  workspaceId: string;
}): Promise<void> =>
  throttlerService.tokenBucketThrottleOrThrow(
    `${workspaceId}-logic-function-execution`,
    1,
    twentyConfigService.get('LOGIC_FUNCTION_EXEC_THROTTLE_LIMIT'),
    twentyConfigService.get('LOGIC_FUNCTION_EXEC_THROTTLE_TTL'),
  );
