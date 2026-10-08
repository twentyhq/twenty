import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { CONTINUE_AGENT_RUN_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/continue-agent-run-job-name.constant';
import { AgentRunnerService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-runner.service';
import { type ContinueAgentRunJobData } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/continue-agent-run-job-data.type';

// no ambient workspace context: a system one would let the run's tools act beyond the run's own auth context
@Processor(MessageQueue.aiQueue)
export class ContinueAgentRunJob {
  constructor(private readonly agentRunnerService: AgentRunnerService) {}

  @Process(CONTINUE_AGENT_RUN_JOB_NAME)
  async handle(jobData: ContinueAgentRunJobData): Promise<void> {
    await this.agentRunnerService.continue(jobData);
  }
}
