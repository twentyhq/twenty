import { describe, expect, it } from 'vitest';

import { getSlackRosterMemberDisplayName } from 'src/logic-functions/utils/get-slack-roster-member-display-name';

describe('getSlackRosterMemberDisplayName', () => {
  it('should prefer the profile display name', () => {
    expect(
      getSlackRosterMemberDisplayName({
        real_name: 'Ada Lovelace',
        profile: { display_name: 'ada' },
      }),
    ).toBe('ada');
  });

  it('should fall back to the real name', () => {
    expect(
      getSlackRosterMemberDisplayName({
        real_name: 'Ada Lovelace',
        profile: { display_name: '' },
      }),
    ).toBe('Ada Lovelace');
  });

  it('should return undefined when no name is set', () => {
    expect(getSlackRosterMemberDisplayName({})).toBeUndefined();
  });
});
