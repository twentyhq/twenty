import { describe, expect, it } from 'vitest';

import { pickContactTeamMemberId } from 'src/utils/pick-contact-team-member';

const MEMBER_A = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const MEMBER_B = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

describe('pickContactTeamMemberId', () => {
  it('prefers the from participant for email', () => {
    const result = pickContactTeamMemberId(
      [
        { role: 'TO', workspaceMemberId: MEMBER_A },
        { role: 'FROM', workspaceMemberId: MEMBER_B },
      ],
      { role: 'FROM' },
    );
    expect(result).toBe(MEMBER_B);
  });

  it('falls back to the first member when no from member exists', () => {
    const result = pickContactTeamMemberId(
      [
        { role: 'TO', workspaceMemberId: null },
        { role: 'CC', workspaceMemberId: MEMBER_A },
      ],
      { role: 'FROM' },
    );
    expect(result).toBe(MEMBER_A);
  });

  it('prefers the organizer for calendar', () => {
    const result = pickContactTeamMemberId(
      [
        { isOrganizer: false, workspaceMemberId: MEMBER_A },
        { isOrganizer: true, workspaceMemberId: MEMBER_B },
      ],
      { isOrganizer: true },
    );
    expect(result).toBe(MEMBER_B);
  });

  it('returns null when no participant is a workspace member', () => {
    const result = pickContactTeamMemberId(
      [{ role: 'TO', workspaceMemberId: null }],
      { role: 'FROM' },
    );
    expect(result).toBeNull();
  });
});
