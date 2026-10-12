import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { AgentTriggerRunnerService } from 'src/engine/metadata-modules/ai/ai-agent-trigger/services/agent-trigger-runner.service';
import { type RunAgentTriggerJobData } from 'src/engine/metadata-modules/ai/ai-agent-trigger/types/run-agent-trigger-job-data.type';

@Processor(MessageQueue.aiQueue)
export class RunAgentTriggerJob {
  constructor(
    private readonly agentTriggerRunnerService: AgentTriggerRunnerService,
  ) {}

  @Process(RunAgentTriggerJob.name)
  async handle(data: RunAgentTriggerJobData): Promise<void> {
    await this.agentTriggerRunnerService.run(data);
  }
}
