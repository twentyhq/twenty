import { type AgentRunCallerOutcome } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-outcome.type';
import { AGENT_TURN_INTERRUPTED_ERROR } from 'src/engine/metadata-modules/ai/ai-history/constants/agent-turn-interrupted-error.constant';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { type AgentTurnWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-turn.workspace-entity';

// A completed turn's result is not kept on it, and a waiting one goes on through its wake-up, so neither
// is settled again; any other turn was cut short and fails
export const buildRetriedAgentRunOutcome = (
  turn: Pick<AgentTurnWorkspaceEntity, 'status' | 'error'>,
): AgentRunCallerOutcome | null => {
  switch (turn.status) {
    case AgentTurnStatus.COMPLETED:
    case AgentTurnStatus.WAITING_FOR_INPUT:
      return null;
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
