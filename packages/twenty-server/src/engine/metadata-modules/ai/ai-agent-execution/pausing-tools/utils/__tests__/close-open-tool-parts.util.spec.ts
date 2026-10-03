import {
  ASK_QUESTIONS_TOOL_NAME,
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
  const update = jest.fn();
  const messagePartRepository = {
    find: jest.fn().mockResolvedValue(parts),
    update,
  } as unknown as AgentHistoryRepository<AgentMessagePartWorkspaceEntity>;

  await closeOpenToolParts({
    messagePartRepository,
    messageId: 'message-id',
    workspaceId: 'workspace-id',
  });

  return update.mock.calls.map(([, { id }, { toolOutput }]) => ({
    id,
    result: toolOutput.result,
  }));
};

describe('closeOpenToolParts', () => {
  it('skips the calls still waiting on an answer', async () => {
    expect(
      await closeParts([
        {
          id: 'questions',
          toolName: ASK_QUESTIONS_TOOL_NAME,
          toolInput: { questions: QUESTIONS },
          toolOutput: { result: { status: 'pending', questions: QUESTIONS } },
        },
      ]),
    ).toEqual([
      {
        id: 'questions',
        result: expect.objectContaining({ status: 'skipped' }),
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
