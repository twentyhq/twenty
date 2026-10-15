import { IsNull } from 'typeorm';

import { AgentChatThreadLifecycleService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-lifecycle.service';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';

const QUESTION = {
  header: 'Plan',
  question: 'Which plan?',
  options: [{ label: 'Pro' }, { label: 'Team' }],
};

const buildService = ({ claimAffected = 1 } = {}) => {
  const steps: string[] = [];
  const threadRepository = {
    update: jest.fn(async () => {
      steps.push('clear question');

      return { affected: claimAffected };
    }),
  };
  const threadRecordEventService = {
    emitPendingQuestionCleared: jest.fn(async () => {
      steps.push('emit');
    }),
  };
  const turnRecorderService = {
    endWaitingTurn: jest.fn(async () => {
      steps.push('end turn');
    }),
  };
  const writePart = jest.fn(async () => {
    steps.push('close part');
  });
  const messagePartRepository = {
    find: jest.fn().mockResolvedValue([
      {
        id: 'part-id',
        toolName: 'ask_question',
        toolInput: QUESTION,
        toolOutput: { result: { question: QUESTION, status: 'pending' } },
      },
    ]),
    query: jest.fn(async (_workspaceId, run) =>
      run({ table: (name: string) => name, manager: { query: writePart } }),
    ),
  };

  const service = new AgentChatThreadLifecycleService(
    threadRepository as never,
    {} as never,
    {} as never,
    threadRecordEventService as never,
    turnRecorderService as never,
    messagePartRepository as never,
  );

  return {
    service,
    steps,
    threadRepository,
    writePart,
    threadRecordEventService,
    turnRecorderService,
  };
};

const closeArguments = {
  workspaceId: 'workspace-id',
  threadId: 'thread-id',
  messageId: 'question-message-id',
  activeStreamId: null,
  turnStatus: AgentTurnStatus.CANCELLED,
} as const;

describe('AgentChatThreadLifecycleService closePendingQuestion', () => {
  it('closes the pending call as skipped and ends the waiting turn with the status given', async () => {
    const { service, writePart, turnRecorderService } = buildService();

    await service.closePendingQuestion(closeArguments);

    const [[closeQuery, [partId, closedToolOutput, expectedStatus]]] = writePart
      .mock.calls as unknown as [[string, [string, string, string]]];

    expect(closeQuery).toContain(`"toolOutput"->'result'->>'status' = $3`);
    expect({ partId, expectedStatus }).toEqual({
      partId: 'part-id',
      expectedStatus: 'pending',
    });
    expect(JSON.parse(closedToolOutput).result).toEqual({
      question: QUESTION,
      status: 'skipped',
    });
    expect(turnRecorderService.endWaitingTurn).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      messageId: 'question-message-id',
      status: AgentTurnStatus.CANCELLED,
    });
  });

  it('tells open chat lists last, once the calls and the turn are closed', async () => {
    const { service, steps, threadRecordEventService } = buildService();

    await service.closePendingQuestion(closeArguments);

    expect(steps).toEqual(['clear question', 'close part', 'end turn', 'emit']);
    expect(
      threadRecordEventService.emitPendingQuestionCleared,
    ).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      threadId: 'thread-id',
      messageId: 'question-message-id',
    });
  });

  it('only claims the question while no stream, or the stream given, holds the thread', async () => {
    const { service, threadRepository } = buildService();

    await service.closePendingQuestion(closeArguments);
    await service.closePendingQuestion({
      ...closeArguments,
      activeStreamId: 'stream-id',
    });

    expect(threadRepository.update.mock.calls).toEqual([
      [
        'workspace-id',
        {
          id: 'thread-id',
          pendingQuestionMessageId: 'question-message-id',
          activeStreamId: IsNull(),
        },
        { pendingQuestionMessageId: null },
      ],
      [
        'workspace-id',
        {
          id: 'thread-id',
          pendingQuestionMessageId: 'question-message-id',
          activeStreamId: 'stream-id',
        },
        { pendingQuestionMessageId: null },
      ],
    ]);
  });

  it('leaves the calls as they are when another caller already closed the question', async () => {
    const { service, steps } = buildService({ claimAffected: 0 });

    await service.closePendingQuestion(closeArguments);

    expect(steps).toEqual(['clear question']);
  });
});
