import { type PendingWakeUpCondition } from 'twenty-shared/pending-wake-up';

import { type AgentWaitPendingOutput } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/wait-tools/agent-wait-pending-output.type';

export const buildWaitPendingOutput = ({
  message,
  wait,
}: {
  message: string;
  wait: PendingWakeUpCondition;
}): AgentWaitPendingOutput => ({
  success: true,
  message,
  result: { status: 'pending', wait },
});
