import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { RUN_AGENT_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/run-agent-job-name.constant';
import { AgentRunnerService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-runner.service';
import { type RunAgentJobData } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/run-agent-job-data.type';

@Processor(MessageQueue.aiQueue)
export class RunAgentJob {
  constructor(private readonly agentRunnerService: AgentRunnerService) {}

  @Process(RUN_AGENT_JOB_NAME)
  async handle(jobData: RunAgentJobData): Promise<void> {
    await this.agentRunnerService.runStarted(jobData);
  }
}
