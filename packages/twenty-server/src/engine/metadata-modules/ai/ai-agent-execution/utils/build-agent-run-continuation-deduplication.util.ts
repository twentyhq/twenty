import { type QueueJobDeduplicationOptions } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import { type AgentRunWakeUpOutcome } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-wake-up-outcome.type';

const CONTINUATION_DEDUPLICATION_PREFIX = 'continue-agent-run';

export const buildAgentRunContinuationDeduplication = ({
  wakeUpId,
  outcomeType,
}: {
  wakeUpId: string;
  outcomeType: AgentRunWakeUpOutcome['type'];
}): QueueJobDeduplicationOptions => {
  const deduplicationId = `${CONTINUATION_DEDUPLICATION_PREFIX}-${wakeUpId}`;

  if (outcomeType === 'MESSAGE_RECEIVED') {
    return { id: `${deduplicationId}-message`, keepLastIfActive: true };
  }

  return { id: deduplicationId };
};
