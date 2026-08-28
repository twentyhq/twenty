import { type WebClient } from '@slack/web-api';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { resolveSlackUserByEmail } from 'src/logic-functions/utils/resolve-slack-user-by-email';

const lookupByEmailMock = vi.fn();

const slackClient = {
  users: { lookupByEmail: lookupByEmailMock },
} as unknown as WebClient;

const confirmedUser = {
  id: 'U1',
  team_id: 'T1',
  real_name: 'Ada Lovelace',
  is_email_confirmed: true,
};

describe('resolveSlackUserByEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return the resolved user when the email is in the workspace', async () => {
    lookupByEmailMock.mockResolvedValue({ user: confirmedUser });

    const result = await resolveSlackUserByEmail(slackClient, 'ada@example.com');

    expect(result).toEqual({
      slackUserId: 'U1',
      slackTeamId: 'T1',
      displayName: 'Ada Lovelace',
    });
  });

  it('should prefer the profile display name over the real name', async () => {
    lookupByEmailMock.mockResolvedValue({
      user: { ...confirmedUser, profile: { display_name: 'ada' } },
    });

    const result = await resolveSlackUserByEmail(slackClient, 'ada@example.com');

    expect(result?.displayName).toBe('ada');
  });

  it('should return undefined when the email is not in the workspace', async () => {
    lookupByEmailMock.mockRejectedValue({ data: { error: 'users_not_found' } });

    const result = await resolveSlackUserByEmail(
      slackClient,
      'guest@example.com',
    );

    expect(result).toBeUndefined();
  });

  it('should refuse an account whose profile email Slack has not confirmed', async () => {
    lookupByEmailMock.mockResolvedValue({
      user: { ...confirmedUser, is_email_confirmed: false },
    });

    const result = await resolveSlackUserByEmail(slackClient, 'ada@example.com');

    expect(result).toBeUndefined();
  });

  it('should refuse a bot account', async () => {
    lookupByEmailMock.mockResolvedValue({
      user: { ...confirmedUser, is_bot: true },
    });

    const result = await resolveSlackUserByEmail(slackClient, 'ada@example.com');

    expect(result).toBeUndefined();
  });

  it('should refuse a deactivated account', async () => {
    lookupByEmailMock.mockResolvedValue({
      user: { ...confirmedUser, deleted: true },
    });

    const result = await resolveSlackUserByEmail(slackClient, 'ada@example.com');

    expect(result).toBeUndefined();
  });

  it('should rethrow a transient Slack error instead of reporting not found', async () => {
    lookupByEmailMock.mockRejectedValue({ data: { error: 'ratelimited' } });

    await expect(
      resolveSlackUserByEmail(slackClient, 'ada@example.com'),
    ).rejects.toEqual({ data: { error: 'ratelimited' } });
  });
});
