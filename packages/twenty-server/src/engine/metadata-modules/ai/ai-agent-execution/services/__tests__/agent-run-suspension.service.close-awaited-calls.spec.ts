import { AgentRunSuspensionService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-suspension.service';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';

const buildService = ({
  pendingQuestionMessageId = 'question-message-id' as string | null,
  isAwaitedByCaller = true,
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
    query: jest.fn().mockResolvedValue(undefined),
    find: jest.fn().mockResolvedValue([
      {
        toolOutput: {
          result: { status: 'pending' },
          awaitedByCaller: isAwaitedByCaller,
        },
      },
    ]),
  };
  const threadLifecycleService = {
    closePendingQuestion: jest.fn().mockResolvedValue(undefined),
  };

  const service = new AgentRunSuspensionService(
    {} as never,
    threadRepository as never,
    messagePartRepository as never,
    threadLifecycleService as never,
    {} as never,
    {} as never,
    {} as never,
  );

  return { service, threadLifecycleService };
};

describe('AgentRunSuspensionService closeAwaitedCalls', () => {
  it('closes the question a dropped run waited on, cancelling the turn that asked it', async () => {
    const { service, threadLifecycleService } = buildService();

    await service.closeAwaitedCalls({
      workspaceId: 'workspace-id',
      threadId: 'thread-id',
    });

    expect(threadLifecycleService.closePendingQuestion).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      threadId: 'thread-id',
      messageId: 'question-message-id',
      activeStreamId: null,
      turnStatus: AgentTurnStatus.CANCELLED,
    });
  });

  it('keeps open a question the member asked of their own', async () => {
    const { service, threadLifecycleService } = buildService({
      isAwaitedByCaller: false,
    });

    await service.closeAwaitedCalls({
      workspaceId: 'workspace-id',
      threadId: 'thread-id',
    });

    expect(threadLifecycleService.closePendingQuestion).not.toHaveBeenCalled();
  });

  it('does nothing when the conversation waits on no question', async () => {
    const { service, threadLifecycleService } = buildService({
      pendingQuestionMessageId: null,
    });

    await service.closeAwaitedCalls({
      workspaceId: 'workspace-id',
      threadId: 'thread-id',
    });

    expect(threadLifecycleService.closePendingQuestion).not.toHaveBeenCalled();
  });
});
