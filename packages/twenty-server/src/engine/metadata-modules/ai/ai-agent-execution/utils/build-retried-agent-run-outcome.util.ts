import { AGENT_RUN_RESULT_LOST_ERROR } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/agent-run-result-lost-error.const';
import { type AgentRunCallerOutcome } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-outcome.type';
import { AGENT_TURN_INTERRUPTED_ERROR } from 'src/engine/metadata-modules/ai/ai-history/constants/agent-turn-interrupted-error.constant';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { type AgentTurnWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-turn.workspace-entity';

// a waiting run goes on through its wake-up, so only its continuation settles it
export const buildRetriedAgentRunOutcome = ({
  turn,
  completedResult,
}: {
  turn: Pick<AgentTurnWorkspaceEntity, 'status' | 'error'>;
  completedResult: object | null;
}): AgentRunCallerOutcome | null => {
  switch (turn.status) {
    case AgentTurnStatus.WAITING_FOR_INPUT:
      return null;
    case AgentTurnStatus.COMPLETED:
      return completedResult === null
        ? { status: 'FAILED', error: AGENT_RUN_RESULT_LOST_ERROR }
        : { status: 'COMPLETED', result: completedResult };
    case AgentTurnStatus.CANCELLED:
      return { status: 'FAILED', error: 'The run was stopped' };
    case AgentTurnStatus.FAILED:
      return {
        status: 'FAILED',
        error: (turn.error ?? AGENT_TURN_INTERRUPTED_ERROR).message,
      };
    case AgentTurnStatus.RUNNING:
      return { status: 'FAILED', error: AGENT_TURN_INTERRUPTED_ERROR.message };
  }
};
