import { AgentRunConversationService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-conversation.service';
import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';

const execution = {
  modelId: 'model-id',
  hasNoMoreAvailableCredits: false,
} as AgentExecutionResult;

const turn = {
  workspaceId: 'workspace-id',
  threadId: 'thread-id',
  turnId: 'turn-id',
};

const buildService = () => {
  const conversationWriterService = {
    insertExecutionReply: jest
      .fn()
      .mockResolvedValue({ isAwaitingAnswer: false, replyParts: [] }),
  };
  const turnRecorderService = {
    finishExecutedTurn: jest.fn().mockResolvedValue(undefined),
  };

  const service = new AgentRunConversationService(
    {} as never,
    conversationWriterService as never,
    {} as never,
    turnRecorderService as never,
  );

  return { service, conversationWriterService, turnRecorderService };
};

describe('AgentRunConversationService.closeTurn', () => {
  it('leaves the turn waiting when the agent asked a question', async () => {
    const { service, conversationWriterService, turnRecorderService } =
      buildService();

    conversationWriterService.insertExecutionReply.mockResolvedValue({
      isAwaitingAnswer: true,
      replyParts: [],
    });

    await service.closeTurn({ ...turn, agentId: 'agent-id', execution });

    expect(turnRecorderService.finishExecutedTurn).toHaveBeenCalledWith({
      ...turn,
      execution,
      isAwaitingAnswer: true,
    });
  });

  it('fails the turn when its reply cannot be saved', async () => {
    const { service, conversationWriterService, turnRecorderService } =
      buildService();

    conversationWriterService.insertExecutionReply.mockRejectedValue(
      new Error('question slot taken'),
    );

    await expect(
      service.closeTurn({ ...turn, agentId: 'agent-id', execution }),
    ).rejects.toThrow('question slot taken');

    expect(turnRecorderService.finishExecutedTurn).toHaveBeenCalledTimes(1);
    expect(turnRecorderService.finishExecutedTurn).toHaveBeenCalledWith({
      ...turn,
      execution,
      error: expect.objectContaining({ code: expect.any(String) }),
    });
  });
});
