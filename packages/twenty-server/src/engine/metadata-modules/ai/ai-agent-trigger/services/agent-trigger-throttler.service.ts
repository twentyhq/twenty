import { Injectable } from '@nestjs/common';

import { AGENT_TRIGGER_RUN_LIMITS } from 'src/engine/metadata-modules/ai/ai-agent-trigger/constants/agent-trigger-run-limits.const';
import { ThrottlerException } from 'src/engine/core-modules/throttler/throttler.exception';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';

@Injectable()
export class AgentTriggerThrottlerService {
  constructor(private readonly throttlerService: ThrottlerService) {}

  async tryConsumeRuns({
    workspaceId,
    agentId,
    runCount,
  }: {
    workspaceId: string;
    agentId: string;
    runCount: number;
  }): Promise<boolean> {
    try {
      await this.throttlerService.tokenBucketThrottleOrThrow(
        `agent-trigger:${workspaceId}:${agentId}`,
        runCount,
        AGENT_TRIGGER_RUN_LIMITS.MAX_RUNS_PER_AGENT_PER_WINDOW,
        AGENT_TRIGGER_RUN_LIMITS.WINDOW_MS,
      );

      return true;
    } catch (error) {
      if (error instanceof ThrottlerException) {
        return false;
      }

      throw error;
    }
  }
}
