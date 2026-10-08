import { type PendingWakeUpEntity } from 'src/engine/core-modules/pending-wake-up/entities/pending-wake-up.entity';
import { AgentRunService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run.service';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';

const RUN = { id: 'run-id', threadId: 'thread-id' };

const buildService = ({
  pendingQuestionMessageId = 'question-message-id' as string | null,
  isAskedSinceRunStarted = true,
  isPostedCallMessage = true,
} = {}) => {
  const threadRepository = {
    findOne: jest
      .fn()
      .mockResolvedValue(
        pendingQuestionMessageId === null
          ? null
          : { id: 'thread-id', pendingQuestionMessageId },
      ),
  };
  const messagePartRepository = {
    query: jest
      .fn()
      // the wait calls update, then the question's age against the run's start
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(isAskedSinceRunStarted),
    existsBy: jest.fn().mockResolvedValue(isPostedCallMessage),
  };
  const threadLifecycleService = {
    closePendingQuestion: jest.fn().mockResolvedValue(undefined),
  };
  const runRepository = {
    findOne: jest
      .fn()
      .mockResolvedValue({ ...RUN, createdAt: new Date('2026-01-01') }),
  };

  const service = new AgentRunService(
    runRepository as never,
    threadRepository as never,
    messagePartRepository as never,
    threadLifecycleService as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
  );

  return { service, threadLifecycleService, messagePartRepository };
};

const EXPECTED_CLOSE = {
  workspaceId: 'workspace-id',
  threadId: 'thread-id',
  messageId: 'question-message-id',
  activeStreamId: null,
  turnStatus: AgentTurnStatus.CANCELLED,
};

describe('AgentRunService closeAwaitedCalls', () => {
  it('closes the question a dropped run waited on, cancelling the turn that asked it', async () => {
    const { service, threadLifecycleService } = buildService();

    await service.closeAwaitedCalls({ workspaceId: 'workspace-id', run: RUN });

    expect(threadLifecycleService.closePendingQuestion).toHaveBeenCalledWith(
      EXPECTED_CLOSE,
    );
  });

  it('keeps open a question the member asked of their own before the run started', async () => {
    const { service, threadLifecycleService } = buildService({
      isAskedSinceRunStarted: false,
    });

    await service.closeAwaitedCalls({ workspaceId: 'workspace-id', run: RUN });

    expect(threadLifecycleService.closePendingQuestion).not.toHaveBeenCalled();
  });

  it('does nothing when the conversation waits on no question', async () => {
    const { service, threadLifecycleService } = buildService({
      pendingQuestionMessageId: null,
    });

    await service.closeAwaitedCalls({ workspaceId: 'workspace-id', run: RUN });

    expect(threadLifecycleService.closePendingQuestion).not.toHaveBeenCalled();
  });
});

describe('AgentRunService closePostedCalls', () => {
  const answerWakeUp = {
    condition: { type: 'ANSWER', threadId: 'thread-id', toolCallId: 'call-id' },
  } as PendingWakeUpEntity;

  it('closes the call a cancelled ANSWER wake-up waited on', async () => {
    const { service, threadLifecycleService, messagePartRepository } =
      buildService();

    await service.closePostedCalls({
      workspaceId: 'workspace-id',
      cancelledWakeUps: [answerWakeUp],
    });

    expect(messagePartRepository.existsBy).toHaveBeenCalledWith(
      'workspace-id',
      { messageId: 'question-message-id', toolCallId: 'call-id' },
    );
    expect(threadLifecycleService.closePendingQuestion).toHaveBeenCalledWith(
      EXPECTED_CLOSE,
    );
  });

  it('keeps open another question the conversation now waits on', async () => {
    const { service, threadLifecycleService } = buildService({
      isPostedCallMessage: false,
    });

    await service.closePostedCalls({
      workspaceId: 'workspace-id',
      cancelledWakeUps: [answerWakeUp],
    });

    expect(threadLifecycleService.closePendingQuestion).not.toHaveBeenCalled();
  });

  it('ignores cancelled wake-ups that wait on time or events', async () => {
    const { service, threadLifecycleService } = buildService();

    await service.closePostedCalls({
      workspaceId: 'workspace-id',
      cancelledWakeUps: [
        { condition: { type: 'TIME', resumeAt: 'now' } } as PendingWakeUpEntity,
      ],
    });

    expect(threadLifecycleService.closePendingQuestion).not.toHaveBeenCalled();
  });
});
