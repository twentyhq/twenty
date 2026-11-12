import { getAgentChatMessageAuthor } from '@/ai/utils/getAgentChatMessageAuthor';

const JULIA = {
  id: 'julia-id',
  name: { firstName: 'Julia', lastName: 'Martin' },
  userEmail: 'julia@example.com',
};

const AUTHOR_CONTEXT = {
  workspaceMembers: [JULIA],
  assistantDisplayName: 'Ada',
  currentWorkspace: null,
};

describe('getAgentChatMessageAuthor', () => {
  it('names a member by their name', () => {
    expect(
      getAgentChatMessageAuthor({
        message: {
          id: 'message-id',
          role: 'user',
          metadata: { senderWorkspaceMemberId: JULIA.id },
        },
        authorContext: AUTHOR_CONTEXT,
      }),
    ).toEqual({
      type: 'member',
      senderWorkspaceMemberId: JULIA.id,
      sender: JULIA,
      name: 'Julia Martin',
      isNameResolved: true,
    });
  });

  it('labels a member who left the workspace', () => {
    expect(
      getAgentChatMessageAuthor({
        message: {
          id: 'message-id',
          role: 'user',
          metadata: { senderWorkspaceMemberId: 'former-member-id' },
        },
        authorContext: AUTHOR_CONTEXT,
      }),
    ).toMatchObject({ name: 'Former member', isNameResolved: false });
  });

  it('names the built-in assistant with its profile name', () => {
    expect(
      getAgentChatMessageAuthor({
        message: {
          id: 'message-id',
          role: 'assistant',
          metadata: { isBuiltInAssistant: true, agentId: 'agent-id' },
        },
        authorContext: AUTHOR_CONTEXT,
      }),
    ).toEqual({ type: 'builtInAssistant', name: 'Ada', isNameResolved: true });
  });

  it('names an agent once its name is known', () => {
    const message = {
      id: 'message-id',
      role: 'assistant' as const,
      metadata: { agentId: 'agent-id' },
    };

    expect(
      getAgentChatMessageAuthor({ message, authorContext: AUTHOR_CONTEXT }),
    ).toEqual({
      type: 'agent',
      agentId: 'agent-id',
      name: 'Agent',
      isNameResolved: false,
    });
    expect(
      getAgentChatMessageAuthor({
        message,
        authorContext: AUTHOR_CONTEXT,
        agentName: 'Sales agent',
      }),
    ).toMatchObject({ name: 'Sales agent', isNameResolved: true });
  });

  it('names an application sender', () => {
    expect(
      getAgentChatMessageAuthor({
        message: {
          id: 'message-id',
          role: 'assistant',
          metadata: { senderApplicationId: 'application-id' },
        },
        authorContext: AUTHOR_CONTEXT,
      }),
    ).toEqual({
      type: 'application',
      applicationId: 'application-id',
      name: 'Application',
      isNameResolved: true,
    });
  });

  it('falls back to a neutral label without a known sender', () => {
    expect(
      getAgentChatMessageAuthor({
        message: { id: 'message-id', role: 'assistant' },
        authorContext: AUTHOR_CONTEXT,
      }).name,
    ).toBe('Assistant');
    expect(
      getAgentChatMessageAuthor({
        message: { id: 'message-id', role: 'user' },
        authorContext: AUTHOR_CONTEXT,
      }).name,
    ).toBe('Unknown sender');
  });
});
