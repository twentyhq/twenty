import { isDefined } from 'twenty-shared/utils';

import { type AgentRunContinuationCompletion } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-continuation-completion.type';
import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { type AgentTurnWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-turn.workspace-entity';

export const canRecoverAgentRunContinuationCompletion = ({
  turn,
  completion,
}: {
  turn: Pick<AgentTurnWorkspaceEntity, 'id' | 'status'>;
  completion?: Pick<
    AgentRunContinuationCompletion,
    'turnId' | 'isAborted' | 'settledOutcome'
  > & { execution: Pick<AgentExecutionResult, 'stopReason'> };
}): boolean => {
  if (
    !isDefined(completion) ||
    completion.turnId !== turn.id ||
    turn.status === AgentTurnStatus.RUNNING
  ) {
    return false;
  }

  if (
    turn.status === AgentTurnStatus.COMPLETED ||
    turn.status === AgentTurnStatus.WAITING_FOR_INPUT
  ) {
    return true;
  }

  if (turn.status === AgentTurnStatus.CANCELLED && completion.isAborted) {
    return true;
  }

  if (
    turn.status === AgentTurnStatus.FAILED &&
    isDefined(completion.execution.stopReason)
  ) {
    return true;
  }

  return completion.settledOutcome?.status === 'FAILED';
};
