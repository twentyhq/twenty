import { describe, expect, it } from 'vitest';

import { type SlackRosterMember } from 'src/logic-functions/types/slack-roster-member.type';
import { getVouchedSlackRosterEmail } from 'src/logic-functions/utils/get-vouched-slack-roster-email';

const INSTALLED_TEAM_ID = 'T-installed';

const vouchedMember: SlackRosterMember = {
  team_id: INSTALLED_TEAM_ID,
  is_email_confirmed: true,
  profile: { email: 'ada@twenty.com' },
};

const getEmail = (member: SlackRosterMember) =>
  getVouchedSlackRosterEmail({
    member,
    installedSlackTeamId: INSTALLED_TEAM_ID,
  });

describe('getVouchedSlackRosterEmail', () => {
  it('should return the email of a full member of the installed workspace', () => {
    expect(getEmail(vouchedMember)).toBe('ada@twenty.com');
  });

  it('should reject an unconfirmed email', () => {
    expect(
      getEmail({ ...vouchedMember, is_email_confirmed: false }),
    ).toBeUndefined();
    expect(
      getEmail({
        team_id: INSTALLED_TEAM_ID,
        profile: { email: 'ada@twenty.com' },
      }),
    ).toBeUndefined();
  });

  it('should reject guests even with a confirmed email', () => {
    expect(getEmail({ ...vouchedMember, is_restricted: true })).toBeUndefined();
    expect(
      getEmail({ ...vouchedMember, is_ultra_restricted: true }),
    ).toBeUndefined();
  });

  it('should reject accounts from another Slack workspace', () => {
    expect(getEmail({ ...vouchedMember, team_id: 'T-other' })).toBeUndefined();
    expect(
      getEmail({
        is_email_confirmed: true,
        profile: { email: 'ada@twenty.com' },
      }),
    ).toBeUndefined();
    expect(getEmail({ ...vouchedMember, is_stranger: true })).toBeUndefined();
  });

  it('should return undefined when the vouched member has no email', () => {
    expect(
      getEmail({ team_id: INSTALLED_TEAM_ID, is_email_confirmed: true }),
    ).toBeUndefined();
  });
});
