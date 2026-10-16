import { setAgentMessageReaction } from '@/ai/utils/setAgentMessageReaction';

const JULIA_ID = 'julia';
const TOM_ID = 'tom';
const AGENT_ID = 'agent';

describe('setAgentMessageReaction', () => {
  it('adds a new emoji after the existing ones', () => {
    expect(
      setAgentMessageReaction({
        reactions: [
          {
            emoji: '👍',
            workspaceMemberIds: [TOM_ID],
            agentIds: [],
            hasAssistantReacted: false,
          },
        ],
        emoji: '🎉',
        workspaceMemberId: JULIA_ID,
        isReacted: true,
      }),
    ).toEqual([
      {
        emoji: '👍',
        workspaceMemberIds: [TOM_ID],
        agentIds: [],
        hasAssistantReacted: false,
      },
      {
        emoji: '🎉',
        workspaceMemberIds: [JULIA_ID],
        agentIds: [],
        hasAssistantReacted: false,
      },
    ]);
  });

  it('joins an emoji someone else used', () => {
    expect(
      setAgentMessageReaction({
        reactions: [
          {
            emoji: '👍',
            workspaceMemberIds: [TOM_ID],
            agentIds: [],
            hasAssistantReacted: false,
          },
        ],
        emoji: '👍',
        workspaceMemberId: JULIA_ID,
        isReacted: true,
      }),
    ).toEqual([
      {
        emoji: '👍',
        workspaceMemberIds: [TOM_ID, JULIA_ID],
        agentIds: [],
        hasAssistantReacted: false,
      },
    ]);
  });

  it('removes the member from an emoji they used', () => {
    expect(
      setAgentMessageReaction({
        reactions: [
          {
            emoji: '👍',
            workspaceMemberIds: [TOM_ID, JULIA_ID],
            agentIds: [],
            hasAssistantReacted: false,
          },
        ],
        emoji: '👍',
        workspaceMemberId: JULIA_ID,
        isReacted: false,
      }),
    ).toEqual([
      {
        emoji: '👍',
        workspaceMemberIds: [TOM_ID],
        agentIds: [],
        hasAssistantReacted: false,
      },
    ]);
  });

  it('drops an emoji nobody uses anymore', () => {
    expect(
      setAgentMessageReaction({
        reactions: [
          {
            emoji: '👍',
            workspaceMemberIds: [JULIA_ID],
            agentIds: [],
            hasAssistantReacted: false,
          },
          {
            emoji: '🎉',
            workspaceMemberIds: [TOM_ID],
            agentIds: [],
            hasAssistantReacted: false,
          },
        ],
        emoji: '👍',
        workspaceMemberId: JULIA_ID,
        isReacted: false,
      }),
    ).toEqual([
      {
        emoji: '🎉',
        workspaceMemberIds: [TOM_ID],
        agentIds: [],
        hasAssistantReacted: false,
      },
    ]);
  });

  it('leaves the reactions as they are when they already match', () => {
    const reactions = [
      {
        emoji: '👍',
        workspaceMemberIds: [JULIA_ID],
        agentIds: [],
        hasAssistantReacted: false,
      },
    ];

    expect(
      setAgentMessageReaction({
        reactions,
        emoji: '👍',
        workspaceMemberId: JULIA_ID,
        isReacted: true,
      }),
    ).toBe(reactions);
    expect(
      setAgentMessageReaction({
        reactions,
        emoji: '🎉',
        workspaceMemberId: JULIA_ID,
        isReacted: false,
      }),
    ).toBe(reactions);
  });

  it('keeps an emoji the assistant also used', () => {
    expect(
      setAgentMessageReaction({
        reactions: [
          {
            emoji: '👍',
            workspaceMemberIds: [JULIA_ID],
            agentIds: [],
            hasAssistantReacted: true,
          },
        ],
        emoji: '👍',
        workspaceMemberId: JULIA_ID,
        isReacted: false,
      }),
    ).toEqual([
      {
        emoji: '👍',
        workspaceMemberIds: [],
        agentIds: [],
        hasAssistantReacted: true,
      },
    ]);
  });

  it('keeps an emoji an agent also used', () => {
    expect(
      setAgentMessageReaction({
        reactions: [
          {
            emoji: '👍',
            workspaceMemberIds: [JULIA_ID],
            agentIds: [AGENT_ID],
            hasAssistantReacted: false,
          },
        ],
        emoji: '👍',
        workspaceMemberId: JULIA_ID,
        isReacted: false,
      }),
    ).toEqual([
      {
        emoji: '👍',
        workspaceMemberIds: [],
        agentIds: [AGENT_ID],
        hasAssistantReacted: false,
      },
    ]);
  });
});
