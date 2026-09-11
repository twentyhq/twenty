import { type WebClient } from '@slack/web-api';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type SlackUserIdentity } from 'src/logic-functions/types/slack-user-identity.type';
import { type SlackUserLinkSummary } from 'src/logic-functions/types/slack-user-link-summary.type';
import { resolveSlackIdentities } from 'src/logic-functions/utils/resolve-slack-identities';

const {
  findSlackUserLinksBySlackUserIdsMock,
  findWorkspaceMemberIdsByEmailsMock,
} = vi.hoisted(() => ({
  findSlackUserLinksBySlackUserIdsMock: vi.fn(),
  findWorkspaceMemberIdsByEmailsMock: vi.fn(),
}));

vi.mock(
  'src/logic-functions/data/find-slack-user-links-by-slack-user-ids',
  () => ({
    findSlackUserLinksBySlackUserIds: findSlackUserLinksBySlackUserIdsMock,
  }),
);

vi.mock('src/logic-functions/data/find-workspace-member-ids-by-emails', () => ({
  findWorkspaceMemberIdsByEmails: findWorkspaceMemberIdsByEmailsMock,
}));

const INSTALLED_TEAM_ID = 'T0INSTALLED';
const EXTERNAL_TEAM_ID = 'T0EXTERNAL';

const client = {} as CoreApiClient;

const authTestMock = vi.fn();
const usersInfoMock = vi.fn();

const slackClient = {
  auth: { test: authTestMock },
  users: { info: usersInfoMock },
} as unknown as WebClient;

const identity = (
  overrides: Partial<SlackUserIdentity> = {},
): SlackUserIdentity => ({
  slackUserId: 'U04ABC',
  slackTeamId: INSTALLED_TEAM_ID,
  displayName: 'alice.m',
  email: 'alice@twenty.com',
  isRegularUserAccount: true,
  ...overrides,
});

const link = (
  overrides: Partial<SlackUserLinkSummary> = {},
): SlackUserLinkSummary => ({
  id: 'link-1',
  slackUserId: 'U04ABC',
  slackTeamId: INSTALLED_TEAM_ID,
  name: 'alice.m',
  workspaceMemberId: 'member-1',
  source: 'MANUAL',
  consentState: 'ACTIVE',
  ...overrides,
});

const resolve = (knownIdentities: SlackUserIdentity[]) =>
  resolveSlackIdentities({
    slackUserIds: knownIdentities.map(
      (knownIdentity) => knownIdentity.slackUserId,
    ),
    knownIdentities,
    client,
    slackClient,
  });

describe('resolveSlackIdentities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authTestMock.mockResolvedValue({ team_id: INSTALLED_TEAM_ID });
    findSlackUserLinksBySlackUserIdsMock.mockResolvedValue(new Map());
    findWorkspaceMemberIdsByEmailsMock.mockResolvedValue({
      workspaceMemberIdByEmail: new Map(),
      ambiguousEmailCount: 0,
    });
    usersInfoMock.mockResolvedValue(undefined);
  });

  it('should credit a hand-picked consented link as the source of the member', async () => {
    findSlackUserLinksBySlackUserIdsMock.mockResolvedValue(
      new Map([['U04ABC', link()]]),
    );

    expect((await resolve([identity()])).get('U04ABC')).toEqual(
      expect.objectContaining({
        outcome: 'confirmedMember',
        workspaceMemberId: 'member-1',
        memberProvenance: 'manualConsentedLink',
      }),
    );
  });

  it('should credit the live verified email when no hand-picked link settles it', async () => {
    findSlackUserLinksBySlackUserIdsMock.mockResolvedValue(
      new Map([
        ['U04ABC', link({ source: 'AUTO', workspaceMemberId: 'member-stale' })],
      ]),
    );
    findWorkspaceMemberIdsByEmailsMock.mockResolvedValue({
      workspaceMemberIdByEmail: new Map([['alice@twenty.com', 'member-live']]),
      ambiguousEmailCount: 0,
    });

    expect((await resolve([identity()])).get('U04ABC')).toEqual(
      expect.objectContaining({
        outcome: 'confirmedMember',
        workspaceMemberId: 'member-live',
        memberProvenance: 'verifiedEmail',
      }),
    );
  });

  it('should keep the member own email match when a manual link is pending or declined', async () => {
    findSlackUserLinksBySlackUserIdsMock.mockResolvedValue(
      new Map([
        [
          'U04ABC',
          link({ consentState: 'PENDING', workspaceMemberId: 'member-other' }),
        ],
      ]),
    );
    findWorkspaceMemberIdsByEmailsMock.mockResolvedValue({
      workspaceMemberIdByEmail: new Map([['alice@twenty.com', 'member-own']]),
      ambiguousEmailCount: 0,
    });

    expect((await resolve([identity()])).get('U04ABC')).toEqual(
      expect.objectContaining({
        outcome: 'confirmedMember',
        workspaceMemberId: 'member-own',
        memberProvenance: 'verifiedEmail',
      }),
    );
  });

  it('should report membership as unconfirmed when a consented link names nobody', async () => {
    findSlackUserLinksBySlackUserIdsMock.mockResolvedValue(
      new Map([['U04ABC', link({ workspaceMemberId: undefined })]]),
    );
    findWorkspaceMemberIdsByEmailsMock.mockResolvedValue({
      workspaceMemberIdByEmail: new Map([['alice@twenty.com', 'member-1']]),
      ambiguousEmailCount: 0,
    });

    expect((await resolve([identity()])).get('U04ABC')?.outcome).toBe(
      'membershipNotConfirmed',
    );
  });

  it('should report membership as unconfirmed for an account outside the installed team', async () => {
    findWorkspaceMemberIdsByEmailsMock.mockResolvedValue({
      workspaceMemberIdByEmail: new Map([['alice@twenty.com', 'member-1']]),
      ambiguousEmailCount: 0,
    });

    const resolution = (
      await resolve([identity({ slackTeamId: EXTERNAL_TEAM_ID })])
    ).get('U04ABC');

    expect(resolution?.outcome).toBe('membershipNotConfirmed');
  });

  it('should keep the stored link of a member linked under an external team', async () => {
    findSlackUserLinksBySlackUserIdsMock.mockResolvedValue(
      new Map([['U04ABC', link({ slackTeamId: EXTERNAL_TEAM_ID })]]),
    );

    const resolution = (
      await resolve([identity({ slackTeamId: EXTERNAL_TEAM_ID })])
    ).get('U04ABC');

    expect(resolution).toEqual(
      expect.objectContaining({
        outcome: 'confirmedMember',
        memberProvenance: 'manualConsentedLink',
      }),
    );
    expect(findSlackUserLinksBySlackUserIdsMock).toHaveBeenCalledWith(client, {
      slackUserIdsBySlackTeamId: new Map([[EXTERNAL_TEAM_ID, ['U04ABC']]]),
    });
  });

  it('should not resolve a member by email for a restricted account', async () => {
    findWorkspaceMemberIdsByEmailsMock.mockResolvedValue({
      workspaceMemberIdByEmail: new Map([['alice@twenty.com', 'member-1']]),
      ambiguousEmailCount: 0,
    });

    const resolution = (
      await resolve([identity({ isRegularUserAccount: false })])
    ).get('U04ABC');

    expect(resolution?.outcome).toBe('membershipNotConfirmed');
    expect(findWorkspaceMemberIdsByEmailsMock).toHaveBeenCalledWith(client, {
      emails: [],
    });
  });

  it('should report an account it cannot identify as unidentified', async () => {
    usersInfoMock.mockRejectedValue(new Error('user_not_found'));

    const resolutions = await resolveSlackIdentities({
      slackUserIds: ['U0GONE'],
      client,
      slackClient,
    });

    expect(resolutions.get('U0GONE')).toEqual({
      slackUserId: 'U0GONE',
      identity: undefined,
      link: undefined,
      outcome: 'unidentified',
    });
  });

  it('should report every mention as unidentified when Slack is unreachable', async () => {
    const resolutions = await resolveSlackIdentities({
      slackUserIds: ['U04ABC'],
      client,
      slackClient: undefined,
    });

    expect(resolutions.get('U04ABC')?.outcome).toBe('unidentified');
    expect(findSlackUserLinksBySlackUserIdsMock).not.toHaveBeenCalled();
  });

  it('should bound how many identities it asks Slack for', async () => {
    usersInfoMock.mockImplementation(({ user }: { user: string }) =>
      Promise.resolve({
        user: {
          id: user,
          team_id: INSTALLED_TEAM_ID,
          profile: { display_name: user, email: `${user}@twenty.com` },
          is_email_confirmed: true,
        },
      }),
    );

    const resolutions = await resolveSlackIdentities({
      slackUserIds: Array.from({ length: 30 }, (_unused, index) => `U${index}`),
      client,
      slackClient,
    });

    expect(usersInfoMock.mock.calls.length).toBeLessThanOrEqual(8);
    expect(resolutions.get('U29')?.outcome).toBe('unidentified');
  });

  it('should not ask Slack again for an identity the caller already has', async () => {
    await resolve([identity()]);

    expect(usersInfoMock).not.toHaveBeenCalled();
  });

  it('should surface a failing link query rather than claiming anything', async () => {
    findSlackUserLinksBySlackUserIdsMock.mockRejectedValue(
      new Error('permission denied'),
    );

    await expect(resolve([identity()])).rejects.toThrow('permission denied');
  });

  it('should revalidate only the accounts a hand-picked link does not settle', async () => {
    findSlackUserLinksBySlackUserIdsMock.mockResolvedValue(
      new Map([['U04ABC', link()]]),
    );

    await resolve([
      identity(),
      identity({
        slackUserId: 'U05DEF',
        email: 'bob@twenty.com',
        displayName: 'Bob Lee',
      }),
    ]);

    expect(findWorkspaceMemberIdsByEmailsMock).toHaveBeenCalledWith(client, {
      emails: ['bob@twenty.com'],
    });
  });
});
