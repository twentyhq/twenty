import { type WebClient } from '@slack/web-api';
import { describe, expect, it, vi } from 'vitest';

import {
  getRosterMemberDisplayName,
  getVouchedRosterEmail,
  isLinkableRosterMember,
  isRosterEmailVouchedForOwner,
  walkSlackRoster,
  type SlackRosterMember,
} from 'src/logic-functions/utils/slack-roster';

const buildSlackClient = (
  pages: { members: SlackRosterMember[]; nextCursor?: string }[],
) => {
  const usersListMock = vi.fn();

  for (const page of pages) {
    usersListMock.mockResolvedValueOnce({
      members: page.members,
      response_metadata: { next_cursor: page.nextCursor },
    });
  }

  return {
    slackClient: { users: { list: usersListMock } } as unknown as WebClient,
    usersListMock,
  };
};

describe('isLinkableRosterMember', () => {
  it('should accept a plain human member', () => {
    expect(isLinkableRosterMember({ id: 'U1' })).toBe(true);
  });

  it('should reject a member without an id', () => {
    expect(isLinkableRosterMember({})).toBe(false);
  });

  it('should reject Slackbot', () => {
    expect(isLinkableRosterMember({ id: 'USLACKBOT' })).toBe(false);
  });

  it('should reject bots', () => {
    expect(isLinkableRosterMember({ id: 'U1', is_bot: true })).toBe(false);
  });

  it('should reject deactivated members', () => {
    expect(isLinkableRosterMember({ id: 'U1', deleted: true })).toBe(false);
  });
});

describe('isRosterEmailVouchedForOwner', () => {
  const INSTALLED_TEAM_ID = 'T-installed';
  const vouchedMember: SlackRosterMember = {
    team_id: INSTALLED_TEAM_ID,
    is_email_confirmed: true,
  };

  it('should accept a full member of the installed workspace with a confirmed email', () => {
    expect(
      isRosterEmailVouchedForOwner({
        member: vouchedMember,
        installedSlackTeamId: INSTALLED_TEAM_ID,
      }),
    ).toBe(true);
  });

  it('should reject an unconfirmed email', () => {
    expect(
      isRosterEmailVouchedForOwner({
        member: { ...vouchedMember, is_email_confirmed: false },
        installedSlackTeamId: INSTALLED_TEAM_ID,
      }),
    ).toBe(false);
    expect(
      isRosterEmailVouchedForOwner({
        member: { team_id: INSTALLED_TEAM_ID },
        installedSlackTeamId: INSTALLED_TEAM_ID,
      }),
    ).toBe(false);
  });

  it('should reject guests even with a confirmed email', () => {
    expect(
      isRosterEmailVouchedForOwner({
        member: { ...vouchedMember, is_restricted: true },
        installedSlackTeamId: INSTALLED_TEAM_ID,
      }),
    ).toBe(false);
    expect(
      isRosterEmailVouchedForOwner({
        member: { ...vouchedMember, is_ultra_restricted: true },
        installedSlackTeamId: INSTALLED_TEAM_ID,
      }),
    ).toBe(false);
  });

  it('should reject accounts from another Slack workspace', () => {
    expect(
      isRosterEmailVouchedForOwner({
        member: { ...vouchedMember, team_id: 'T-other' },
        installedSlackTeamId: INSTALLED_TEAM_ID,
      }),
    ).toBe(false);
    expect(
      isRosterEmailVouchedForOwner({
        member: { is_email_confirmed: true },
        installedSlackTeamId: INSTALLED_TEAM_ID,
      }),
    ).toBe(false);
    expect(
      isRosterEmailVouchedForOwner({
        member: { ...vouchedMember, is_stranger: true },
        installedSlackTeamId: INSTALLED_TEAM_ID,
      }),
    ).toBe(false);
  });
});

describe('getVouchedRosterEmail', () => {
  const INSTALLED_TEAM_ID = 'T-installed';

  it('should return the email of a vouched member', () => {
    expect(
      getVouchedRosterEmail({
        member: {
          team_id: INSTALLED_TEAM_ID,
          is_email_confirmed: true,
          profile: { email: 'ada@twenty.com' },
        },
        installedSlackTeamId: INSTALLED_TEAM_ID,
      }),
    ).toBe('ada@twenty.com');
  });

  it('should return undefined for a member whose email is not vouched', () => {
    expect(
      getVouchedRosterEmail({
        member: {
          team_id: INSTALLED_TEAM_ID,
          is_restricted: true,
          is_email_confirmed: true,
          profile: { email: 'guest@example.com' },
        },
        installedSlackTeamId: INSTALLED_TEAM_ID,
      }),
    ).toBeUndefined();
  });

  it('should return undefined when the vouched member has no email', () => {
    expect(
      getVouchedRosterEmail({
        member: { team_id: INSTALLED_TEAM_ID, is_email_confirmed: true },
        installedSlackTeamId: INSTALLED_TEAM_ID,
      }),
    ).toBeUndefined();
  });
});

describe('getRosterMemberDisplayName', () => {
  it('should prefer the profile display name', () => {
    expect(
      getRosterMemberDisplayName({
        real_name: 'Ada Lovelace',
        profile: { display_name: 'ada' },
      }),
    ).toBe('ada');
  });

  it('should fall back to the real name', () => {
    expect(
      getRosterMemberDisplayName({
        real_name: 'Ada Lovelace',
        profile: { display_name: '' },
      }),
    ).toBe('Ada Lovelace');
  });

  it('should return undefined when no name is set', () => {
    expect(getRosterMemberDisplayName({})).toBeUndefined();
  });
});

describe('walkSlackRoster', () => {
  it('should visit only linkable members', async () => {
    const { slackClient } = buildSlackClient([
      {
        members: [
          { id: 'U1' },
          { id: 'U-bot', is_bot: true },
          { id: 'USLACKBOT' },
          { id: 'U2' },
        ],
      },
    ]);
    const visited: string[] = [];

    const { isTruncated } = await walkSlackRoster(slackClient, (member) => {
      visited.push(member.id ?? '');

      return undefined;
    });

    expect(visited).toEqual(['U1', 'U2']);
    expect(isTruncated).toBe(false);
  });

  it('should follow pagination cursors', async () => {
    const { slackClient, usersListMock } = buildSlackClient([
      { members: [{ id: 'U1' }], nextCursor: 'cursor-2' },
      { members: [{ id: 'U2' }] },
    ]);
    const visited: string[] = [];

    const { isTruncated } = await walkSlackRoster(slackClient, (member) => {
      visited.push(member.id ?? '');

      return undefined;
    });

    expect(visited).toEqual(['U1', 'U2']);
    expect(isTruncated).toBe(false);
    expect(usersListMock).toHaveBeenNthCalledWith(2, {
      limit: 200,
      cursor: 'cursor-2',
    });
  });

  it('should report truncation when the visitor stops early', async () => {
    const { slackClient, usersListMock } = buildSlackClient([
      { members: [{ id: 'U1' }, { id: 'U2' }], nextCursor: 'cursor-2' },
    ]);

    const { isTruncated } = await walkSlackRoster(slackClient, () => 'stop');

    expect(isTruncated).toBe(true);
    expect(usersListMock).toHaveBeenCalledTimes(1);
  });

  it('should report truncation when the page cap is reached', async () => {
    const { slackClient, usersListMock } = buildSlackClient(
      Array.from({ length: 6 }, (_, index) => ({
        members: [{ id: `U${index}` }],
        nextCursor: `cursor-${index + 1}`,
      })),
    );

    const { isTruncated } = await walkSlackRoster(slackClient, () => undefined);

    expect(isTruncated).toBe(true);
    expect(usersListMock).toHaveBeenCalledTimes(5);
  });
});
