import { toggleAgentMessageReaction } from '@/ai/utils/toggleAgentMessageReaction';

const JULIA_ID = 'julia';
const TOM_ID = 'tom';

describe('toggleAgentMessageReaction', () => {
  it('adds a new emoji after the existing ones', () => {
    expect(
      toggleAgentMessageReaction({
        reactions: [{ emoji: '👍', workspaceMemberIds: [TOM_ID] }],
        emoji: '🎉',
        workspaceMemberId: JULIA_ID,
      }),
    ).toEqual([
      { emoji: '👍', workspaceMemberIds: [TOM_ID] },
      { emoji: '🎉', workspaceMemberIds: [JULIA_ID] },
    ]);
  });

  it('joins an emoji someone else used', () => {
    expect(
      toggleAgentMessageReaction({
        reactions: [{ emoji: '👍', workspaceMemberIds: [TOM_ID] }],
        emoji: '👍',
        workspaceMemberId: JULIA_ID,
      }),
    ).toEqual([{ emoji: '👍', workspaceMemberIds: [TOM_ID, JULIA_ID] }]);
  });

  it('removes the member from an emoji they used', () => {
    expect(
      toggleAgentMessageReaction({
        reactions: [{ emoji: '👍', workspaceMemberIds: [TOM_ID, JULIA_ID] }],
        emoji: '👍',
        workspaceMemberId: JULIA_ID,
      }),
    ).toEqual([{ emoji: '👍', workspaceMemberIds: [TOM_ID] }]);
  });

  it('drops an emoji nobody uses anymore', () => {
    expect(
      toggleAgentMessageReaction({
        reactions: [
          { emoji: '👍', workspaceMemberIds: [JULIA_ID] },
          { emoji: '🎉', workspaceMemberIds: [TOM_ID] },
        ],
        emoji: '👍',
        workspaceMemberId: JULIA_ID,
      }),
    ).toEqual([{ emoji: '🎉', workspaceMemberIds: [TOM_ID] }]);
  });
});
