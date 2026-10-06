import { FieldActorSource } from 'twenty-shared/types';

import { AgentRunConversationService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-conversation.service';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';

const buildService = () => {
  const scope = { insert: jest.fn().mockResolvedValue(undefined) };
  const conversationWriterService = {
    runInTransaction: jest
      .fn()
      .mockImplementation(async (_workspaceId, work) => work(scope)),
    insertTurn: jest.fn().mockResolvedValue('turn-id'),
    insertMessage: jest.fn().mockResolvedValue(undefined),
  };

  return {
    service: new AgentRunConversationService(
      { findOne: jest.fn().mockResolvedValue(null) } as never,
      conversationWriterService as never,
      {} as never,
      {} as never,
    ),
    conversationWriterService,
  };
};

describe('AgentRunConversationService openTurn', () => {
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
});
