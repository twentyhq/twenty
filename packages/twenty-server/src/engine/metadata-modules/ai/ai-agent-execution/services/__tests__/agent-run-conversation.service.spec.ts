import { randomUUID } from 'node:crypto';

import { FieldActorSource } from 'twenty-shared/types';

import { AgentRunConversationService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-conversation.service';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentMessageStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-status.enum';

const CLAIM = {
  workspaceId: 'workspace-id',
  threadId: 'thread-id',
  title: 'Draft the quote',
  streamId: 'stream-id',
};

const buildService = ({
  thread = null,
  isClaimed = true,
  queuedMessageCount = 0,
}: {
  thread?: { id: string; activeStreamId: string | null } | null;
  isClaimed?: boolean;
  queuedMessageCount?: number;
} = {}) => {
  const scope = {
    insert: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(queuedMessageCount),
  };
  const conversationWriterService = {
    runInTransaction: jest
      .fn()
      .mockImplementation(async (_workspaceId, work) => work(scope)),
    insertTurn: jest.fn().mockResolvedValue('turn-id'),
    insertMessage: jest
      .fn()
      .mockImplementation(async () => `message-${randomUUID()}`),
  };
  const streamRecoveryService = {
    reapDeadStream: jest.fn().mockResolvedValue(null),
    tryClaimStream: jest.fn().mockResolvedValue(isClaimed),
  };

  return {
    service: new AgentRunConversationService(
      { findOne: jest.fn().mockResolvedValue(thread) } as never,
      conversationWriterService as never,
      streamRecoveryService as never,
    ),
    scope,
    conversationWriterService,
    streamRecoveryService,
  };
};

describe('AgentRunConversationService', () => {
  it('creates a new conversation before holding it', async () => {
    const { service, scope, streamRecoveryService } = buildService();

    await expect(service.claimThread(CLAIM)).resolves.toBe(true);

    expect(scope.insert).toHaveBeenCalledWith('agentChatThread', {
      id: 'thread-id',
      title: 'Draft the quote',
    });
    expect(streamRecoveryService.tryClaimStream).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      threadId: 'thread-id',
      streamId: 'stream-id',
    });
  });

  it('frees a conversation held by a stream whose worker died before holding it', async () => {
    const thread = { id: 'thread-id', activeStreamId: 'dead-stream-id' };
    const { service, scope, streamRecoveryService } = buildService({ thread });

    await service.claimThread(CLAIM);

    expect(scope.insert).not.toHaveBeenCalled();
    expect(streamRecoveryService.reapDeadStream).toHaveBeenCalledWith({
      thread,
      workspaceId: 'workspace-id',
    });
  });

  it('leaves a conversation another reply holds to it', async () => {
    const { service } = buildService({
      thread: { id: 'thread-id', activeStreamId: 'live-stream-id' },
      isClaimed: false,
    });

    await expect(service.claimThread(CLAIM)).resolves.toBe(false);
  });

  it('stores handed-over replies as assistant messages with no sender', async () => {
    const { service, conversationWriterService } = buildService();

    await service.openTurn({
      workspaceId: 'workspace-id',
      threadId: 'thread-id',
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

    expect(
      conversationWriterService.insertMessage.mock.calls.map(([message]) => ({
        role: message.role,
        senderUserWorkspaceId: message.senderUserWorkspaceId,
        text: message.parts[0].text,
      })),
    ).toEqual([
      {
        role: AgentMessageRole.USER,
        senderUserWorkspaceId: 'user-workspace-id',
        text: 'Who is our biggest customer?',
      },
      {
        role: AgentMessageRole.ASSISTANT,
        senderUserWorkspaceId: null,
        text: 'Acme.',
      },
      {
        role: AgentMessageRole.USER,
        senderUserWorkspaceId: 'user-workspace-id',
        text: 'And the second one?',
      },
    ]);
  });

  it('takes the messages members queued in the conversation as the input of the turn', async () => {
    const { service, scope } = buildService({ queuedMessageCount: 2 });

    const { turnId, promptMessageIds, hasTakenQueuedMessages } =
      await service.openTurn({
        workspaceId: 'workspace-id',
        threadId: 'thread-id',
        agentId: 'agent-id',
        senderUserWorkspaceId: null,
        senderApplicationId: null,
        createdBy: {
          source: FieldActorSource.WORKFLOW,
          name: 'New deals',
          workspaceMemberId: null,
          context: {},
        },
        messages: [],
      });

    expect(scope.update).toHaveBeenCalledWith(
      'agentMessage',
      { threadId: 'thread-id', status: AgentMessageStatus.QUEUED },
      expect.objectContaining({ status: AgentMessageStatus.SENT, turnId }),
    );
    expect(promptMessageIds).toEqual([]);
    expect(hasTakenQueuedMessages).toBe(true);
  });
});
