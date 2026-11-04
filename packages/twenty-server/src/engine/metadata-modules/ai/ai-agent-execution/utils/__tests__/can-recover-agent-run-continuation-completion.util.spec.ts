import { canRecoverAgentRunContinuationCompletion } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/can-recover-agent-run-continuation-completion.util';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';

const TURN_ID = 'continuation-turn-id';
const COMPLETION: NonNullable<
  Parameters<typeof canRecoverAgentRunContinuationCompletion>[0]['completion']
> = {
  turnId: TURN_ID,
  isAborted: false,
  execution: { stopReason: null },
};

describe('canRecoverAgentRunContinuationCompletion', () => {
  it.each([
    {
      name: 'a completed turn',
      status: AgentTurnStatus.COMPLETED,
      completion: COMPLETION,
      expected: true,
    },
    {
      name: 'a recorded wait',
      status: AgentTurnStatus.WAITING_FOR_INPUT,
      completion: COMPLETION,
      expected: true,
    },
    {
      name: 'an unfinished turn',
      status: AgentTurnStatus.RUNNING,
      completion: COMPLETION,
      expected: false,
    },
    {
      name: 'another turn completion',
      status: AgentTurnStatus.COMPLETED,
      completion: { ...COMPLETION, turnId: 'another-turn-id' },
      expected: false,
    },
    {
      name: 'a recorded stop',
      status: AgentTurnStatus.CANCELLED,
      completion: { ...COMPLETION, isAborted: true },
      expected: true,
    },
    {
      name: 'a recorded credit failure',
      status: AgentTurnStatus.FAILED,
      completion: {
        ...COMPLETION,
        execution: { stopReason: 'workspaceAllowance' as const },
      },
      expected: true,
    },
    {
      name: 'an interrupted failure',
      status: AgentTurnStatus.FAILED,
      completion: COMPLETION,
      expected: false,
    },
    {
      name: 'a saved settlement failure',
      status: AgentTurnStatus.FAILED,
      completion: {
        ...COMPLETION,
        settledOutcome: {
          status: 'FAILED' as const,
          error: 'Settlement failed',
        },
      },
      expected: true,
    },
    {
      name: 'a turn without a saved completion',
      status: AgentTurnStatus.COMPLETED,
      completion: undefined,
      expected: false,
    },
  ])('classifies $name', ({ status, completion, expected }) => {
    expect(
      canRecoverAgentRunContinuationCompletion({
        turn: { id: TURN_ID, status },
        completion,
      }),
    ).toBe(expected);
  });
});
