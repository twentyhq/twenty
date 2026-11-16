import { Injectable } from '@nestjs/common';

import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

// Logic functions and HTTP requests spend one bucket: an HTTP step can do nothing a logic function cannot.
@Injectable()
export class LogicFunctionExecutionThrottleService {
  constructor(
    private readonly throttlerService: ThrottlerService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async consumeToken(workspaceId: string): Promise<boolean> {
    const admittedCount = await this.throttlerService.tokenBucketConsumeUpTo(
      `${workspaceId}-logic-function-execution`,
      1,
      this.twentyConfigService.get('LOGIC_FUNCTION_EXEC_THROTTLE_LIMIT'),
      this.twentyConfigService.get('LOGIC_FUNCTION_EXEC_THROTTLE_TTL'),
    );

    return admittedCount === 1;
  }
}
