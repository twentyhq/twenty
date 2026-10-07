import { FieldActorSource } from 'twenty-shared/types';

import { AgentRunConversationService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-conversation.service';
import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';

const execution = {
  modelId: 'model-id',
  hasNoMoreAvailableCredits: false,
} as AgentExecutionResult;

const turn = {
  workspaceId: 'workspace-id',
  threadId: 'thread-id',
  turnId: 'turn-id',
};

const buildService = ({
  thread = null,
}: { thread?: { id: string; channelId: string | null } | null } = {}) => {
  const scope = { insert: jest.fn().mockResolvedValue(undefined) };
  const threadRepository = { findOne: jest.fn().mockResolvedValue(thread) };
  const defaultChannelService = {
    findSystemThreadChannel: jest.fn().mockResolvedValue({
      channelId: 'system-channel-id',
      channelArchivedAt: '2026-10-07T00:00:00.000Z',
    }),
  };
  const conversationWriterService = {
    runInTransaction: jest
      .fn()
      .mockImplementation(async (_workspaceId, work) => work(scope)),
    insertTurn: jest.fn().mockResolvedValue('turn-id'),
    insertMessage: jest.fn().mockResolvedValue(undefined),
    insertExecutionReply: jest
      .fn()
      .mockResolvedValue({ isAwaitingAnswer: false, replyParts: [] }),
  };
  const turnRecorderService = {
    finish: jest.fn().mockResolvedValue(undefined),
    finishExecutedTurn: jest.fn().mockResolvedValue(undefined),
  };
  const threadService = {
    recordThreadActivity: jest.fn().mockResolvedValue(undefined),
  };

  return {
    service: new AgentRunConversationService(
      threadRepository as never,
      conversationWriterService as never,
      {} as never,
      turnRecorderService as never,
      threadService as never,
      defaultChannelService as never,
    ),
    scope,
    conversationWriterService,
    turnRecorderService,
    threadService,
    defaultChannelService,
  };
};

const openTurn = (service: AgentRunConversationService) =>
  service.openTurn({
    workspaceId: 'workspace-id',
    threadId: 'thread-id',
    title: 'Helper',
    agentId: 'agent-id',
    senderUserWorkspaceId: null,
    senderApplicationId: 'application-id',
    createdBy: {
      source: FieldActorSource.APPLICATION,
      name: 'Helper app',
      workspaceMemberId: null,
      context: {},
    },
    messages: [{ role: 'user', content: 'Who is our biggest customer?' }],
  });

const closeTurn = (service: AgentRunConversationService) =>
  service.closeTurn({
    ...turn,
    title: 'Draft the quote',
    agentId: 'agent-id',
    execution,
  });

describe('AgentRunConversationService', () => {
  it('stores handed-over replies as assistant messages with no sender', async () => {
    const { service, conversationWriterService } = buildService();

    await service.openTurn({
      workspaceId: 'workspace-id',
      threadId: 'thread-id',
      title: 'Helper',
      agentId: 'agent-id',
      senderUserWorkspaceId: 'user-workspace-id',
      senderApplicationId: null,
      createdBy: {
        source: FieldActorSource.MANUAL,
        name: 'Tim Apple',
        workspaceMemberId: 'workspace-member-id',
        context: {},
      },
      messages: [
        { role: 'user', content: 'Who is our biggest customer?' },
        { role: 'assistant', content: 'Acme.' },
        { role: 'user', content: 'And the second one?' },
      ],
    });

    expect(conversationWriterService.insertMessage).toHaveBeenCalledTimes(3);
    expect(
      conversationWriterService.insertMessage.mock.calls.map(([message]) => ({
        role: message.role,
        agentId: message.agentId,
        senderUserWorkspaceId: message.senderUserWorkspaceId,
        text: message.parts[0].text,
      })),
    ).toEqual([
      {
        role: AgentMessageRole.USER,
        agentId: null,
        senderUserWorkspaceId: 'user-workspace-id',
        text: 'Who is our biggest customer?',
      },
      {
        role: AgentMessageRole.ASSISTANT,
        agentId: null,
        senderUserWorkspaceId: null,
        text: 'Acme.',
      },
      {
        role: AgentMessageRole.USER,
        agentId: null,
        senderUserWorkspaceId: 'user-workspace-id',
        text: 'And the second one?',
      },
    ]);
  });

  it('leaves the turn waiting and brings the conversation back to the inbox when the agent asked a question', async () => {
    const {
      service,
      conversationWriterService,
      turnRecorderService,
      threadService,
    } = buildService();

    conversationWriterService.insertExecutionReply.mockResolvedValue({
      isAwaitingAnswer: true,
      replyParts: [{ type: 'text', text: 'Which plan?' }],
    });

    await expect(closeTurn(service)).resolves.toEqual({
      isAwaitingAnswer: true,
    });
    expect(turnRecorderService.finishExecutedTurn).toHaveBeenCalledWith({
      ...turn,
      execution,
      isAwaitingAnswer: true,
    });
    expect(threadService.recordThreadActivity).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      threadId: 'thread-id',
      text: 'Which plan?',
    });
  });

  it('keeps the answer awaited when the inbox cannot be told', async () => {
    const { service, conversationWriterService, threadService } =
      buildService();

    conversationWriterService.insertExecutionReply.mockResolvedValue({
      isAwaitingAnswer: true,
      replyParts: [],
    });
    threadService.recordThreadActivity.mockRejectedValue(new Error('boom'));

    await expect(closeTurn(service)).resolves.toEqual({
      isAwaitingAnswer: true,
    });
  });

  it('fails the turn when its reply cannot be saved', async () => {
    const { service, conversationWriterService, turnRecorderService } =
      buildService();

    conversationWriterService.insertExecutionReply.mockRejectedValue(
      new Error('question slot taken'),
    );

    await expect(closeTurn(service)).rejects.toThrow('question slot taken');

    expect(turnRecorderService.finishExecutedTurn).toHaveBeenCalledTimes(1);
    expect(turnRecorderService.finishExecutedTurn).toHaveBeenCalledWith({
      ...turn,
      execution,
      error: expect.objectContaining({ code: expect.any(String) }),
    });
  });

  it('files a new conversation as done in the System channel', async () => {
    const { service, scope } = buildService();

    await openTurn(service);

    expect(scope.insert).toHaveBeenCalledWith('agentChatThread', {
      id: 'thread-id',
      title: 'Helper',
      channelId: 'system-channel-id',
      channelArchivedAt: '2026-10-07T00:00:00.000Z',
    });
  });

  it('leaves an existing conversation where it is', async () => {
    const { service, scope, defaultChannelService } = buildService({
      thread: { id: 'thread-id', channelId: null },
    });

    await openTurn(service);

    expect(
      defaultChannelService.findSystemThreadChannel,
    ).not.toHaveBeenCalled();
    expect(scope.insert).not.toHaveBeenCalledWith(
      'agentChatThread',
      expect.anything(),
    );
  });

  it('brings a failed conversation back in its channel', async () => {
    const thread = { id: 'thread-id', channelId: 'system-channel-id' };
    const { service, threadService } = buildService({ thread });

    await service.failTurn({ ...turn, error: new Error('Model unavailable') });

    expect(threadService.recordThreadActivity).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      threadId: 'thread-id',
      text: 'Model unavailable',
      threadBefore: thread,
    });
  });

  it('leaves a failed conversation outside channels as it is', async () => {
    const { service, threadService } = buildService({
      thread: { id: 'thread-id', channelId: null },
    });

    await service.failTurn({ ...turn, error: new Error('Model unavailable') });

    expect(threadService.recordThreadActivity).not.toHaveBeenCalled();
  });

  it('marks the calls it leaves pending as awaited by a caller', async () => {
    const { service, conversationWriterService, threadService } =
      buildService();

    await service.closeTurn({
      ...turn,
      title: 'Draft the quote',
      agentId: null,
      execution,
      isAwaitedByCaller: true,
    });

    expect(conversationWriterService.insertExecutionReply).toHaveBeenCalledWith(
      expect.objectContaining({ isAwaitedByCaller: true }),
    );
    expect(threadService.recordThreadActivity).not.toHaveBeenCalled();
  });
});
