import { Injectable } from '@nestjs/common';

import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { AGENT_TRIGGER_RUN_LIMITS } from 'src/engine/metadata-modules/ai/ai-agent-trigger/constants/agent-trigger-run-limits.const';

@Injectable()
export class AgentTriggerThrottlerService {
  constructor(private readonly throttlerService: ThrottlerService) {}

  // Grants what is left of the agent's allowance, so a large batch still runs up to the limit
  async consumeAvailableRuns({
    workspaceId,
    agentId,
    requestedRunCount,
  }: {
    workspaceId: string;
    agentId: string;
    requestedRunCount: number;
  }): Promise<number> {
    return this.throttlerService.tokenBucketConsumeUpTo(
      `agent-trigger:${workspaceId}:${agentId}`,
      requestedRunCount,
      AGENT_TRIGGER_RUN_LIMITS.MAX_RUNS_PER_AGENT_PER_WINDOW,
      AGENT_TRIGGER_RUN_LIMITS.WINDOW_MS,
    );
  }
}
