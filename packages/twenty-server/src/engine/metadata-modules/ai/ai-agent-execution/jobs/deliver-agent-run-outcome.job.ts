import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { DELIVER_AGENT_RUN_OUTCOME_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/deliver-agent-run-outcome-job-name.constant';
import { AgentRunSuspensionService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-suspension.service';
import { type AgentRunOutcomeDelivery } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-outcome-delivery.type';

@Processor(MessageQueue.aiQueue)
export class DeliverAgentRunOutcomeJob {
  constructor(
    private readonly agentRunSuspensionService: AgentRunSuspensionService,
  ) {}

  @Process(DELIVER_AGENT_RUN_OUTCOME_JOB_NAME)
  async handle(delivery: AgentRunOutcomeDelivery) {
    await this.agentRunSuspensionService.deliverOutcome(delivery);
  }
}
