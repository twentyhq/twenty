import { type WebClient } from '@slack/web-api';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchSlackUserIdentity } from 'src/logic-functions/utils/fetch-slack-user-identity';

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
      isRegularMemberOfOwnTeam: true,
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
    ['a multi-channel guest', { is_restricted: true }],
    ['a single-channel guest', { is_ultra_restricted: true }],
    ['a bot', { is_bot: true }],
    ['Slackbot', { id: 'USLACKBOT' }],
    ['a deactivated account', { deleted: true }],
    ['an unconfirmed email', { is_email_confirmed: false }],
  ])('should not treat %s as a regular member', async (_label, overrides) => {
    usersInfoMock.mockResolvedValue({ user: buildSlackUser(overrides) });

    const identity = await fetchSlackUserIdentity({
      client,
      slackUserId: SLACK_USER_ID,
    });

    expect(identity?.isRegularMemberOfOwnTeam).toBe(false);
  });

  it('should report a missing email rather than judging eligibility on it', async () => {
    usersInfoMock.mockResolvedValue({
      user: buildSlackUser({ profile: { display_name: 'ada' } }),
    });

    const identity = await fetchSlackUserIdentity({
      client,
      slackUserId: SLACK_USER_ID,
    });

    expect(identity?.email).toBeUndefined();
  });

  it('should report the Slack team without judging it', async () => {
    usersInfoMock.mockResolvedValue({
      user: buildSlackUser({ team_id: 'T0EXTERNAL' }),
    });

    const identity = await fetchSlackUserIdentity({
      client,
      slackUserId: SLACK_USER_ID,
    });

    expect(identity?.slackTeamId).toBe('T0EXTERNAL');
    expect(identity?.isRegularMemberOfOwnTeam).toBe(true);
  });
});
