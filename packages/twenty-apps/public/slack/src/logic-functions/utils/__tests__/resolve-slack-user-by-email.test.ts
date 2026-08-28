import { type WebClient } from '@slack/web-api';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { resolveSlackUserByEmail } from 'src/logic-functions/utils/resolve-slack-user-by-email';

const INSTALLED_TEAM_ID = 'T0INSTALLED';
const SLACK_USER_ID = 'U0123456789';
const EMAIL = 'ada@twenty.com';

const lookupByEmailMock = vi.fn();

const client = {
  users: { lookupByEmail: lookupByEmailMock },
} as unknown as WebClient;

const buildSlackUser = (overrides: Record<string, unknown> = {}) => ({
  id: SLACK_USER_ID,
  team_id: INSTALLED_TEAM_ID,
  real_name: 'Ada Lovelace',
  is_email_confirmed: true,
  ...overrides,
});

describe('resolveSlackUserByEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lookupByEmailMock.mockResolvedValue({ user: buildSlackUser() });
  });

  it('should return undefined when the email is not in the workspace', async () => {
    lookupByEmailMock.mockRejectedValue({ data: { error: 'users_not_found' } });

    expect(await resolveSlackUserByEmail(client, EMAIL)).toBeUndefined();
  });

  it('should rethrow a transient Slack error instead of reporting not found', async () => {
    lookupByEmailMock.mockRejectedValue({ data: { error: 'ratelimited' } });

    await expect(resolveSlackUserByEmail(client, EMAIL)).rejects.toEqual({
      data: { error: 'ratelimited' },
    });
  });

  it('should return undefined when the resolved user has no id', async () => {
    lookupByEmailMock.mockResolvedValue({ user: buildSlackUser({ id: '' }) });

    expect(await resolveSlackUserByEmail(client, EMAIL)).toBeUndefined();
  });

  it('should refuse an account whose profile email Slack has not confirmed', async () => {
    lookupByEmailMock.mockResolvedValue({
      user: buildSlackUser({ is_email_confirmed: false }),
    });

    expect(await resolveSlackUserByEmail(client, EMAIL)).toBeUndefined();
  });

  it('should refuse a bot account', async () => {
    lookupByEmailMock.mockResolvedValue({
      user: buildSlackUser({ is_bot: true }),
    });

    expect(await resolveSlackUserByEmail(client, EMAIL)).toBeUndefined();
  });

  it('should refuse a deactivated account', async () => {
    lookupByEmailMock.mockResolvedValue({
      user: buildSlackUser({ deleted: true }),
    });

    expect(await resolveSlackUserByEmail(client, EMAIL)).toBeUndefined();
  });

  it('should resolve the Slack user id, team id and display name', async () => {
    expect(await resolveSlackUserByEmail(client, EMAIL)).toEqual({
      slackUserId: SLACK_USER_ID,
      slackTeamId: INSTALLED_TEAM_ID,
      displayName: 'Ada Lovelace',
    });
  });

  it('should prefer the profile display name over the real name', async () => {
    lookupByEmailMock.mockResolvedValue({
      user: buildSlackUser({ profile: { display_name: 'ada' } }),
    });

    const resolved = await resolveSlackUserByEmail(client, EMAIL);

    expect(resolved?.displayName).toBe('ada');
  });

  it('should leave the team id undefined when Slack omits it', async () => {
    lookupByEmailMock.mockResolvedValue({
      user: buildSlackUser({ team_id: '' }),
    });

    const resolved = await resolveSlackUserByEmail(client, EMAIL);

    expect(resolved?.slackTeamId).toBeUndefined();
  });

  it('should leave the display name undefined when Slack omits the real name', async () => {
    lookupByEmailMock.mockResolvedValue({
      user: buildSlackUser({ real_name: '' }),
    });

    const resolved = await resolveSlackUserByEmail(client, EMAIL);

    expect(resolved?.displayName).toBeUndefined();
  });
});
