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
  ...overrides,
});

describe('resolveSlackUserByEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lookupByEmailMock.mockResolvedValue({ user: buildSlackUser() });
  });

  it('should return undefined when the Slack lookup fails', async () => {
    lookupByEmailMock.mockRejectedValue(new Error('users_not_found'));

    expect(await resolveSlackUserByEmail(client, EMAIL)).toBeUndefined();
  });

  it('should return undefined when the resolved user has no id', async () => {
    lookupByEmailMock.mockResolvedValue({ user: buildSlackUser({ id: '' }) });

    expect(await resolveSlackUserByEmail(client, EMAIL)).toBeUndefined();
  });

  it('should resolve the Slack user id, team id and display name', async () => {
    expect(await resolveSlackUserByEmail(client, EMAIL)).toEqual({
      slackUserId: SLACK_USER_ID,
      slackTeamId: INSTALLED_TEAM_ID,
      displayName: 'Ada Lovelace',
    });
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
