import { Logger } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { AgentTurnGraderService } from 'src/engine/metadata-modules/ai/ai-agent-monitor/services/agent-turn-grader.service';

export type EvaluateAgentTurnJobData = {
  turnId: string;
  workspaceId: string;
};

@Processor(MessageQueue.aiQueue)
export class EvaluateAgentTurnJob {
  private readonly logger = new Logger(EvaluateAgentTurnJob.name);

  constructor(private readonly graderService: AgentTurnGraderService) {}

  @Process(EvaluateAgentTurnJob.name)
  async handle(data: EvaluateAgentTurnJobData): Promise<void> {
    if (!data.turnId) {
      throw new Error('Turn ID is required');
    }

    if (!data.workspaceId) {
      throw new Error('Workspace ID is required');
    }

    const evaluation = await this.graderService.evaluateTurn(data.turnId);

    this.logger.log(
      `Evaluation completed for turn ${data.turnId}: score=${evaluation.score}`,
    );
  }
}
