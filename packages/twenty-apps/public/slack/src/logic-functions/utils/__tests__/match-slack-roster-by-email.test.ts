import { type WebClient } from '@slack/web-api';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { matchSlackRosterByEmail } from 'src/logic-functions/utils/match-slack-roster-by-email';
import { type SlackRosterMember } from 'src/logic-functions/types/slack-roster-member.type';

const {
  coreApiClientMock,
  listWorkspaceMemberEmailsMock,
  listLinkedSlackUserIdsMock,
  persistSlackUserLinkMock,
} = vi.hoisted(() => ({
  coreApiClientMock: vi.fn(),
  listWorkspaceMemberEmailsMock: vi.fn(),
  listLinkedSlackUserIdsMock: vi.fn(),
  persistSlackUserLinkMock: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: coreApiClientMock,
}));

vi.mock('src/logic-functions/data/list-workspace-member-emails', () => ({
  listWorkspaceMemberEmails: listWorkspaceMemberEmailsMock,
}));

vi.mock('src/logic-functions/data/list-linked-slack-user-ids', () => ({
  listLinkedSlackUserIds: listLinkedSlackUserIdsMock,
}));

vi.mock('src/logic-functions/utils/persist-slack-user-link', () => ({
  persistSlackUserLink: persistSlackUserLinkMock,
}));

const SLACK_TEAM_ID = 'T-installed';

const buildSlackClient = (members: SlackRosterMember[]): WebClient =>
  ({
    users: {
      list: vi.fn().mockResolvedValue({
        members,
        response_metadata: { next_cursor: undefined },
      }),
    },
  }) as unknown as WebClient;

const fullMember = ({
  id,
  email,
  displayName,
}: {
  id: string;
  email?: string;
  displayName?: string;
}): SlackRosterMember => ({
  id,
  team_id: SLACK_TEAM_ID,
  is_email_confirmed: true,
  real_name: displayName,
  profile: { email, display_name: displayName },
});

describe('matchSlackRosterByEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listWorkspaceMemberEmailsMock.mockResolvedValue(
      new Map([['ada@twenty.com', 'member-ada']]),
    );
    listLinkedSlackUserIdsMock.mockResolvedValue(new Set());
    persistSlackUserLinkMock.mockResolvedValue('link-new');
  });

  it('should link a roster member whose email matches a workspace member', async () => {
    const summary = await matchSlackRosterByEmail({
      slackClient: buildSlackClient([
        fullMember({ id: 'U1', email: 'ada@twenty.com', displayName: 'Ada' }),
      ]),
      slackTeamId: SLACK_TEAM_ID,
    });

    expect(persistSlackUserLinkMock).toHaveBeenCalledWith(expect.anything(), {
      existingLink: undefined,
      isSameMemberRelink: false,
      slackTeamId: SLACK_TEAM_ID,
      slackUserId: 'U1',
      workspaceMemberId: 'member-ada',
      name: 'Ada',
      source: 'AUTO',
      consentState: 'ACTIVE',
    });
    expect(summary).toEqual({
      linkedCount: 1,
      alreadyLinkedCount: 0,
      unmatchedCount: 0,
      failedCount: 0,
      isRosterTruncated: false,
    });
  });

  it('should match emails case-insensitively', async () => {
    const summary = await matchSlackRosterByEmail({
      slackClient: buildSlackClient([
        fullMember({ id: 'U1', email: 'Ada@Twenty.com' }),
      ]),
      slackTeamId: SLACK_TEAM_ID,
    });

    expect(summary.linkedCount).toBe(1);
  });

  it('should skip roster members that already have a link of any state', async () => {
    listLinkedSlackUserIdsMock.mockResolvedValue(new Set(['U1']));

    const summary = await matchSlackRosterByEmail({
      slackClient: buildSlackClient([
        fullMember({ id: 'U1', email: 'ada@twenty.com' }),
      ]),
      slackTeamId: SLACK_TEAM_ID,
    });

    expect(persistSlackUserLinkMock).not.toHaveBeenCalled();
    expect(summary).toEqual({
      linkedCount: 0,
      alreadyLinkedCount: 1,
      unmatchedCount: 0,
      failedCount: 0,
      isRosterTruncated: false,
    });
  });

  it('should count a roster member with no workspace match as unmatched', async () => {
    const summary = await matchSlackRosterByEmail({
      slackClient: buildSlackClient([
        fullMember({ id: 'U1', email: 'stranger@elsewhere.com' }),
      ]),
      slackTeamId: SLACK_TEAM_ID,
    });

    expect(persistSlackUserLinkMock).not.toHaveBeenCalled();
    expect(summary.unmatchedCount).toBe(1);
  });

  it('should not trust a guest email even when it matches', async () => {
    const summary = await matchSlackRosterByEmail({
      slackClient: buildSlackClient([
        {
          ...fullMember({ id: 'U1', email: 'ada@twenty.com' }),
          is_restricted: true,
        },
      ]),
      slackTeamId: SLACK_TEAM_ID,
    });

    expect(persistSlackUserLinkMock).not.toHaveBeenCalled();
    expect(summary.unmatchedCount).toBe(1);
  });

  it('should not trust an account from another Slack workspace even when it matches', async () => {
    const summary = await matchSlackRosterByEmail({
      slackClient: buildSlackClient([
        {
          ...fullMember({ id: 'U1', email: 'ada@twenty.com' }),
          team_id: 'T-other',
        },
      ]),
      slackTeamId: SLACK_TEAM_ID,
    });

    expect(persistSlackUserLinkMock).not.toHaveBeenCalled();
    expect(summary.unmatchedCount).toBe(1);
  });

  it('should not trust an unconfirmed email even when it matches', async () => {
    const summary = await matchSlackRosterByEmail({
      slackClient: buildSlackClient([
        {
          ...fullMember({ id: 'U1', email: 'ada@twenty.com' }),
          is_email_confirmed: false,
        },
      ]),
      slackTeamId: SLACK_TEAM_ID,
    });

    expect(persistSlackUserLinkMock).not.toHaveBeenCalled();
    expect(summary.unmatchedCount).toBe(1);
  });

  it('should summarize a mixed roster', async () => {
    listLinkedSlackUserIdsMock.mockResolvedValue(new Set(['U-linked']));
    listWorkspaceMemberEmailsMock.mockResolvedValue(
      new Map([
        ['ada@twenty.com', 'member-ada'],
        ['grace@twenty.com', 'member-grace'],
      ]),
    );

    const summary = await matchSlackRosterByEmail({
      slackClient: buildSlackClient([
        fullMember({ id: 'U1', email: 'ada@twenty.com' }),
        fullMember({ id: 'U2', email: 'grace@twenty.com' }),
        fullMember({ id: 'U-linked', email: 'grace@twenty.com' }),
        fullMember({ id: 'U3', email: 'stranger@elsewhere.com' }),
        fullMember({ id: 'U4' }),
      ]),
      slackTeamId: SLACK_TEAM_ID,
    });

    expect(persistSlackUserLinkMock).toHaveBeenCalledTimes(2);
    expect(summary).toEqual({
      linkedCount: 2,
      alreadyLinkedCount: 1,
      unmatchedCount: 2,
      failedCount: 0,
      isRosterTruncated: false,
    });
  });

  it('should keep linking after one candidate fails and count the failure', async () => {
    listWorkspaceMemberEmailsMock.mockResolvedValue(
      new Map([
        ['ada@twenty.com', 'member-ada'],
        ['grace@twenty.com', 'member-grace'],
      ]),
    );
    persistSlackUserLinkMock
      .mockRejectedValueOnce(new Error('write failed'))
      .mockResolvedValueOnce('link-new');

    const summary = await matchSlackRosterByEmail({
      slackClient: buildSlackClient([
        fullMember({ id: 'U1', email: 'ada@twenty.com' }),
        fullMember({ id: 'U2', email: 'grace@twenty.com' }),
      ]),
      slackTeamId: SLACK_TEAM_ID,
    });

    expect(persistSlackUserLinkMock).toHaveBeenCalledTimes(2);
    expect(summary.linkedCount).toBe(1);
    expect(summary.failedCount).toBe(1);
  });

  it('should report truncation when the roster exceeds the page cap', async () => {
    const usersListMock = vi.fn().mockResolvedValue({
      members: [fullMember({ id: 'U1', email: 'ada@twenty.com' })],
      response_metadata: { next_cursor: 'cursor-next' },
    });

    const summary = await matchSlackRosterByEmail({
      slackClient: {
        users: { list: usersListMock },
      } as unknown as WebClient,
      slackTeamId: SLACK_TEAM_ID,
    });

    expect(summary.isRosterTruncated).toBe(true);
  });
});
