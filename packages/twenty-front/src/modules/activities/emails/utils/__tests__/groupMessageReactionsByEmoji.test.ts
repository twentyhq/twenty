import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';

import { groupMessageReactionsByEmoji } from '@/activities/emails/utils/groupMessageReactionsByEmoji';

describe('groupMessageReactionsByEmoji', () => {
  it('groups reactors by emoji, naming them like the participants', () => {
    expect(
      groupMessageReactionsByEmoji({
        reactions: [
          { id: '1', handle: 'ada', displayName: 'Ada L.', emoji: '👍' },
          { id: '2', handle: 'grace', displayName: 'Grace', emoji: '👍' },
          { id: '3', handle: 'linus', displayName: null, emoji: '🎉' },
        ],
        displayNameByHandle: new Map([['ada', 'Ada Lovelace']]),
      }),
    ).toEqual([
      { emoji: '👍', reactorNames: ['Ada Lovelace', 'Grace'] },
      { emoji: '🎉', reactorNames: ['linus'] },
    ]);
  });

  it('leaves out reactions hidden by channel visibility', () => {
    expect(
      groupMessageReactionsByEmoji({
        reactions: [
          {
            id: '1',
            handle: 'ada',
            displayName: null,
            emoji: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
          },
        ],
        displayNameByHandle: new Map(),
      }),
    ).toEqual([]);
  });
});
