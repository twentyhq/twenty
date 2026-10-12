import {
  ASK_QUESTION_TOOL_NAME,
  PROPOSE_TOOL_CALL_TOOL_NAME,
} from 'twenty-shared/ai';

import { closeOpenToolParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/close-open-tool-parts.util';
import { type AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { type AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';

const PROPOSAL = {
  toolName: 'update_one_company',
  toolLabel: 'Update company',
  summary: 'Raise the headcount',
  template: 'generic',
  arguments: { id: 'company-id', employees: 25 },
};
const PROPOSE_INPUT = {
  toolName: 'update_one_company',
  arguments: { id: 'company-id', employees: 25 },
  summary: 'Raise the headcount',
};
const QUESTIONS = [
  {
    header: 'Plan',
    question: 'Which plan?',
    options: [{ label: 'Pro' }, { label: 'Team' }],
  },
];

const closeParts = async (
  parts: Partial<AgentMessagePartWorkspaceEntity>[],
) => {
  const writes: { id: string; result: unknown; expectedStatus: string }[] = [];
  const messagePartRepository = {
    find: jest.fn().mockResolvedValue(parts),
    query: jest.fn(async (_workspaceId, run) =>
      run({
        table: (name: string) => name,
        manager: {
          query: async (
            _sql: string,
            [id, toolOutput, expectedStatus]: [string, string, string],
          ) =>
            writes.push({
              id,
              result: JSON.parse(toolOutput).result,
              expectedStatus,
            }),
        },
      }),
    ),
  } as unknown as AgentHistoryRepository<AgentMessagePartWorkspaceEntity>;

  await closeOpenToolParts({
    messagePartRepository,
    messageId: 'message-id',
    workspaceId: 'workspace-id',
  });

  return writes;
};

describe('closeOpenToolParts', () => {
  it('skips the calls still waiting on an answer', async () => {
    expect(
      await closeParts([
        {
          id: 'questions',
          toolName: ASK_QUESTION_TOOL_NAME,
          toolInput: QUESTIONS[0],
          toolOutput: { result: { status: 'pending', question: QUESTIONS[0] } },
        },
      ]),
    ).toEqual([
      {
        id: 'questions',
        result: expect.objectContaining({ status: 'skipped' }),
        expectedStatus: 'pending',
      },
    ]);
  });

  it('closes an approved call whose outcome was never recorded as interrupted', async () => {
    expect(
      await closeParts([
        {
          id: 'proposal',
          toolName: PROPOSE_TOOL_CALL_TOOL_NAME,
          toolInput: PROPOSE_INPUT,
          toolOutput: { result: { status: 'running', proposal: PROPOSAL } },
        },
      ]),
    ).toEqual([
      {
        id: 'proposal',
        result: {
          status: 'failed',
          proposal: PROPOSAL,
          error:
            'Interrupted before its outcome was recorded. It may or may not have run.',
        },
        expectedStatus: 'running',
      },
    ]);
  });

  it('leaves answered calls and other parts as they are', async () => {
    expect(
      await closeParts([
        {
          id: 'answered',
          toolName: PROPOSE_TOOL_CALL_TOOL_NAME,
          toolInput: PROPOSE_INPUT,
          toolOutput: { result: { status: 'approved', proposal: PROPOSAL } },
        },
        { id: 'text', toolName: null, toolInput: null, toolOutput: null },
      ]),
    ).toEqual([]);
  });
});
