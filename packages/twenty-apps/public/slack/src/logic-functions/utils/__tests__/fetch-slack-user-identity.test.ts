import { type WebClient } from '@slack/web-api';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchSlackUserIdentity } from 'src/logic-functions/utils/fetch-slack-user-identity';

const { resolveSlackInstalledTeamIdMock } = vi.hoisted(() => ({
  resolveSlackInstalledTeamIdMock: vi.fn(),
}));

vi.mock('src/logic-functions/utils/resolve-slack-installed-team-id', () => ({
  resolveSlackInstalledTeamId: resolveSlackInstalledTeamIdMock,
}));

const INSTALLED_TEAM_ID = 'T0INSTALLED';
const SLACK_USER_ID = 'U0123456789';

const usersInfoMock = vi.fn();

const client = {
  users: { info: usersInfoMock },
} as unknown as WebClient;

const buildSlackUser = (overrides: Record<string, unknown> = {}) => ({
  id: SLACK_USER_ID,
  team_id: INSTALLED_TEAM_ID,
  real_name: 'Ada Lovelace',
  profile: { display_name: 'ada', email: 'ada@twenty.com' },
  ...overrides,
});

describe('fetchSlackUserIdentity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resolveSlackInstalledTeamIdMock.mockResolvedValue(INSTALLED_TEAM_ID);
    usersInfoMock.mockResolvedValue({ user: buildSlackUser() });
  });

  it('should return undefined when no Slack user id is given', async () => {
    const identity = await fetchSlackUserIdentity({
      client,
      slackUserId: undefined,
    });

    expect(identity).toBeUndefined();
    expect(usersInfoMock).not.toHaveBeenCalled();
  });

  it('should return undefined when the Slack lookup fails', async () => {
    usersInfoMock.mockRejectedValue(new Error('missing_scope'));

    expect(
      await fetchSlackUserIdentity({ client, slackUserId: SLACK_USER_ID }),
    ).toBeUndefined();
  });

  it('should allow matching a member of the installing Slack workspace', async () => {
    const identity = await fetchSlackUserIdentity({
      client,
      slackUserId: SLACK_USER_ID,
    });

    expect(identity).toEqual({
      slackUserId: SLACK_USER_ID,
      slackTeamId: INSTALLED_TEAM_ID,
      displayName: 'ada',
      email: 'ada@twenty.com',
      canBeMatchedOnEmail: true,
    });
  });

  it('should fall back to the real name when no display name is set', async () => {
    usersInfoMock.mockResolvedValue({
      user: buildSlackUser({
        profile: { display_name: '', email: 'ada@twenty.com' },
      }),
    });

    const identity = await fetchSlackUserIdentity({
      client,
      slackUserId: SLACK_USER_ID,
    });

    expect(identity?.displayName).toBe('Ada Lovelace');
  });

  it.each([
    ['a Slack Connect user from another workspace', { team_id: 'T0EXTERNAL' }],
    ['a multi-channel guest', { is_restricted: true }],
    ['a single-channel guest', { is_ultra_restricted: true }],
    ['a bot', { is_bot: true }],
    ['Slackbot', { id: 'USLACKBOT' }],
    ['a deactivated account', { deleted: true }],
    ['an unconfirmed email', { is_email_confirmed: false }],
    [
      'a profile without an email',
      { profile: { display_name: 'ada', email: undefined } },
    ],
  ])('should refuse to match %s on email', async (_label, overrides) => {
    usersInfoMock.mockResolvedValue({ user: buildSlackUser(overrides) });

    const identity = await fetchSlackUserIdentity({
      client,
      slackUserId: SLACK_USER_ID,
    });

    expect(identity?.canBeMatchedOnEmail).toBe(false);
  });

  it('should refuse to match on email when the installing team is unknown', async () => {
    resolveSlackInstalledTeamIdMock.mockResolvedValue(undefined);

    const identity = await fetchSlackUserIdentity({
      client,
      slackUserId: SLACK_USER_ID,
    });

    expect(identity?.canBeMatchedOnEmail).toBe(false);
  });
});
