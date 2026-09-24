import { type WebClient } from '@slack/web-api';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { matchSlackRosterByEmail } from 'src/logic-functions/utils/match-slack-roster-by-email';
import { type SlackRosterMember } from 'src/logic-functions/types/slack-roster-member.type';

const {
  coreApiClientMock,
  findWorkspaceMemberIdsByEmailsMock,
  listLinkedSlackUserIdsMock,
  linkSlackRosterCandidatesMock,
  saveSlackRosterMatchRunOutcomeMock,
} = vi.hoisted(() => ({
  coreApiClientMock: vi.fn(),
  findWorkspaceMemberIdsByEmailsMock: vi.fn(),
  listLinkedSlackUserIdsMock: vi.fn(),
  linkSlackRosterCandidatesMock: vi.fn(),
  saveSlackRosterMatchRunOutcomeMock: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: coreApiClientMock,
}));

vi.mock('src/logic-functions/data/find-workspace-member-ids-by-emails', () => ({
  findWorkspaceMemberIdsByEmails: findWorkspaceMemberIdsByEmailsMock,
}));

vi.mock('src/logic-functions/data/list-linked-slack-user-ids', () => ({
  listLinkedSlackUserIds: listLinkedSlackUserIdsMock,
}));

vi.mock('src/logic-functions/utils/link-slack-roster-candidates', () => ({
  linkSlackRosterCandidates: linkSlackRosterCandidatesMock,
}));

vi.mock(
  'src/logic-functions/utils/save-slack-roster-match-run-outcome',
  () => ({
    saveSlackRosterMatchRunOutcome: saveSlackRosterMatchRunOutcomeMock,
  }),
);

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

const linkedCandidates = () =>
  linkSlackRosterCandidatesMock.mock.calls[0][1].candidates;

describe('matchSlackRosterByEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findWorkspaceMemberIdsByEmailsMock.mockResolvedValue({
      workspaceMemberIdByEmail: new Map([['ada@twenty.com', 'member-ada']]),
      ambiguousEmailCount: 0,
    });
    listLinkedSlackUserIdsMock.mockResolvedValue(new Set());
    linkSlackRosterCandidatesMock.mockImplementation(
      async (_client, { candidates }) => ({
        linkedCount: candidates.length,
        failedCount: 0,
      }),
    );
  });

  it('should link a roster member whose email matches a workspace member', async () => {
    const summary = await matchSlackRosterByEmail({
      slackClient: buildSlackClient([
        fullMember({ id: 'U1', email: 'ada@twenty.com', displayName: 'Ada' }),
      ]),
      slackTeamId: SLACK_TEAM_ID,
    });

    expect(linkSlackRosterCandidatesMock).toHaveBeenCalledWith(
      expect.anything(),
      {
        slackTeamId: SLACK_TEAM_ID,
        candidates: [
          {
            slackUserId: 'U1',
            workspaceMemberId: 'member-ada',
            displayName: 'Ada',
          },
        ],
      },
    );
    expect(summary).toEqual({
      linkedCount: 1,
      alreadyLinkedCount: 0,
      unmatchedCount: 0,
      ambiguousEmailCount: 0,
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

    expect(linkedCandidates()).toEqual([]);
    expect(summary).toEqual({
      linkedCount: 0,
      alreadyLinkedCount: 1,
      unmatchedCount: 0,
      ambiguousEmailCount: 0,
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

    expect(linkedCandidates()).toEqual([]);
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

    expect(linkedCandidates()).toEqual([]);
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

    expect(linkedCandidates()).toEqual([]);
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

    expect(linkedCandidates()).toEqual([]);
    expect(summary.unmatchedCount).toBe(1);
  });

  it('should carry the shared-email skip count into the summary', async () => {
    findWorkspaceMemberIdsByEmailsMock.mockResolvedValue({
      workspaceMemberIdByEmail: new Map(),
      ambiguousEmailCount: 2,
    });

    const summary = await matchSlackRosterByEmail({
      slackClient: buildSlackClient([
        fullMember({ id: 'U1', email: 'shared@twenty.com' }),
      ]),
      slackTeamId: SLACK_TEAM_ID,
    });

    expect(summary.ambiguousEmailCount).toBe(2);
  });

  it('should look up only the emails the roster vouches for', async () => {
    await matchSlackRosterByEmail({
      slackClient: buildSlackClient([
        fullMember({ id: 'U1', email: 'ada@twenty.com' }),
        { id: 'U2', team_id: SLACK_TEAM_ID, profile: { email: 'guest@x.com' } },
      ]),
      slackTeamId: SLACK_TEAM_ID,
    });

    expect(findWorkspaceMemberIdsByEmailsMock).toHaveBeenCalledWith(
      expect.anything(),
      { emails: ['ada@twenty.com'] },
    );
  });

  it('should summarize a mixed roster', async () => {
    listLinkedSlackUserIdsMock.mockResolvedValue(new Set(['U-linked']));
    findWorkspaceMemberIdsByEmailsMock.mockResolvedValue({
      workspaceMemberIdByEmail: new Map([
        ['ada@twenty.com', 'member-ada'],
        ['grace@twenty.com', 'member-grace'],
      ]),
      ambiguousEmailCount: 0,
    });

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

    expect(linkedCandidates()).toHaveLength(2);
    expect(summary).toEqual({
      linkedCount: 2,
      alreadyLinkedCount: 1,
      unmatchedCount: 2,
      ambiguousEmailCount: 0,
      failedCount: 0,
      isRosterTruncated: false,
    });
  });

  it('should record a completed match as successful', async () => {
    await matchSlackRosterByEmail({
      slackClient: buildSlackClient([
        fullMember({ id: 'U1', email: 'ada@twenty.com' }),
      ]),
      slackTeamId: SLACK_TEAM_ID,
    });

    expect(saveSlackRosterMatchRunOutcomeMock).toHaveBeenCalledWith({
      isSuccessful: true,
    });
  });

  it('should record a match with failed writes as unsuccessful', async () => {
    linkSlackRosterCandidatesMock.mockResolvedValue({
      linkedCount: 0,
      failedCount: 1,
    });

    await matchSlackRosterByEmail({
      slackClient: buildSlackClient([
        fullMember({ id: 'U1', email: 'ada@twenty.com' }),
      ]),
      slackTeamId: SLACK_TEAM_ID,
    });

    expect(saveSlackRosterMatchRunOutcomeMock).toHaveBeenCalledWith({
      isSuccessful: false,
    });
  });

  it('should record the failure and rethrow when the match blows up', async () => {
    listLinkedSlackUserIdsMock.mockRejectedValue(new Error('kaboom'));

    await expect(
      matchSlackRosterByEmail({
        slackClient: buildSlackClient([]),
        slackTeamId: SLACK_TEAM_ID,
      }),
    ).rejects.toThrow('kaboom');

    expect(saveSlackRosterMatchRunOutcomeMock).toHaveBeenCalledWith({
      isSuccessful: false,
      errorMessage: 'kaboom',
    });
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
