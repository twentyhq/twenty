import { AgentChatThreadRecordEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-record-event.service';

const CLEARED_THREAD = {
  id: 'thread-id',
  pendingQuestionMessageId: null,
};

const buildService = (storedThread: unknown = CLEARED_THREAD) => {
  const threadRepository = {
    findOne: jest.fn().mockResolvedValue(storedThread),
  };
  const service = new AgentChatThreadRecordEventService(
    threadRepository as never,
    {} as never,
    {} as never,
  );
  const emitThreadUpdated = jest
    .spyOn(service, 'emitThreadUpdated')
    .mockResolvedValue(undefined);

  return { service, emitThreadUpdated };
};

describe('AgentChatThreadRecordEventService emitPendingQuestionCleared', () => {
  const clearArguments = {
    workspaceId: 'workspace-id',
    threadId: 'thread-id',
    messageId: 'question-message-id',
  };

  it('reports the thread as no longer waiting on the question', async () => {
    const { service, emitThreadUpdated } = buildService();

    await service.emitPendingQuestionCleared(clearArguments);

    expect(emitThreadUpdated).toHaveBeenCalledTimes(1);
    expect(emitThreadUpdated).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      threadBefore: {
        ...CLEARED_THREAD,
        pendingQuestionMessageId: 'question-message-id',
      },
      threadAfter: CLEARED_THREAD,
    });
  });

  it('does nothing when the thread is gone', async () => {
    const { service, emitThreadUpdated } = buildService(null);

    await service.emitPendingQuestionCleared(clearArguments);

    expect(emitThreadUpdated).not.toHaveBeenCalled();
  });

  it('does not fail the caller when the event cannot be sent', async () => {
    const { service, emitThreadUpdated } = buildService();

    emitThreadUpdated.mockRejectedValue(new Error('cache down'));

    await expect(
      service.emitPendingQuestionCleared(clearArguments),
    ).resolves.toBeUndefined();
  });
});
