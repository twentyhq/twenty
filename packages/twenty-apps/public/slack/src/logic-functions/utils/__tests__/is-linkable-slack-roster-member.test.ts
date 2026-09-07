import { describe, expect, it } from 'vitest';

import { isLinkableSlackRosterMember } from 'src/logic-functions/utils/is-linkable-slack-roster-member';

describe('isLinkableSlackRosterMember', () => {
  it('should accept a plain human member', () => {
    expect(isLinkableSlackRosterMember({ id: 'U1' })).toBe(true);
  });

  it('should reject a member without an id', () => {
    expect(isLinkableSlackRosterMember({})).toBe(false);
  });

  it('should reject Slackbot', () => {
    expect(isLinkableSlackRosterMember({ id: 'USLACKBOT' })).toBe(false);
  });

  it('should reject bots', () => {
    expect(isLinkableSlackRosterMember({ id: 'U1', is_bot: true })).toBe(false);
  });

  it('should reject deactivated members', () => {
    expect(isLinkableSlackRosterMember({ id: 'U1', deleted: true })).toBe(
      false,
    );
  });
});
