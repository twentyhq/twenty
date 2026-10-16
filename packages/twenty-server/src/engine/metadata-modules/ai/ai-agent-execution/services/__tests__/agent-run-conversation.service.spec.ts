import { FieldActorSource } from 'twenty-shared/types';

import { AgentRunConversationService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-conversation.service';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';

const CLAIM = {
  workspaceId: 'workspace-id',
  threadId: 'thread-id',
  title: 'Draft the quote',
  streamId: 'stream-id',
};

const buildService = ({
  thread = null,
  isClaimed = true,
}: {
  thread?: { id: string; activeStreamId: string | null } | null;
  isClaimed?: boolean;
} = {}) => {
  const scope = { insert: jest.fn().mockResolvedValue(undefined) };
  const conversationWriterService = {
    runInTransaction: jest
      .fn()
      .mockImplementation(async (_workspaceId, work) => work(scope)),
    insertTurn: jest.fn().mockResolvedValue('turn-id'),
    insertMessage: jest.fn().mockResolvedValue(undefined),
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
});
