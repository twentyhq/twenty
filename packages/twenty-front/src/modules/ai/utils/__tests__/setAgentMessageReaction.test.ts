import { setAgentMessageReaction } from '@/ai/utils/setAgentMessageReaction';

const JULIA_ID = 'julia';
const TOM_ID = 'tom';

describe('setAgentMessageReaction', () => {
  it('adds a new emoji after the existing ones', () => {
    expect(
      setAgentMessageReaction({
        reactions: [{ emoji: '👍', workspaceMemberIds: [TOM_ID] }],
        emoji: '🎉',
        workspaceMemberId: JULIA_ID,
        isReacted: true,
      }),
    ).toEqual([
      { emoji: '👍', workspaceMemberIds: [TOM_ID] },
      { emoji: '🎉', workspaceMemberIds: [JULIA_ID] },
    ]);
  });

  it('joins an emoji someone else used', () => {
    expect(
      setAgentMessageReaction({
        reactions: [{ emoji: '👍', workspaceMemberIds: [TOM_ID] }],
        emoji: '👍',
        workspaceMemberId: JULIA_ID,
        isReacted: true,
      }),
    ).toEqual([{ emoji: '👍', workspaceMemberIds: [TOM_ID, JULIA_ID] }]);
  });

  it('removes the member from an emoji they used', () => {
    expect(
      setAgentMessageReaction({
        reactions: [{ emoji: '👍', workspaceMemberIds: [TOM_ID, JULIA_ID] }],
        emoji: '👍',
        workspaceMemberId: JULIA_ID,
        isReacted: false,
      }),
    ).toEqual([{ emoji: '👍', workspaceMemberIds: [TOM_ID] }]);
  });

  it('drops an emoji nobody uses anymore', () => {
    expect(
      setAgentMessageReaction({
        reactions: [
          { emoji: '👍', workspaceMemberIds: [JULIA_ID] },
          { emoji: '🎉', workspaceMemberIds: [TOM_ID] },
        ],
        emoji: '👍',
        workspaceMemberId: JULIA_ID,
        isReacted: false,
      }),
    ).toEqual([{ emoji: '🎉', workspaceMemberIds: [TOM_ID] }]);
  });

  it('leaves the reactions as they are when they already match', () => {
    const reactions = [{ emoji: '👍', workspaceMemberIds: [JULIA_ID] }];

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
});
