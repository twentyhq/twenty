import { type WebClient } from '@slack/web-api';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { resolveSlackUserByEmail } from 'src/logic-functions/utils/resolve-slack-user-by-email';

const lookupByEmailMock = vi.fn();

const slackClient = {
  users: { lookupByEmail: lookupByEmailMock },
} as unknown as WebClient;

describe('resolveSlackUserByEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return the resolved user when the email is in the workspace', async () => {
    lookupByEmailMock.mockResolvedValue({
      user: { id: 'U1', team_id: 'T1', real_name: 'Ada Lovelace' },
    });

    const result = await resolveSlackUserByEmail(slackClient, 'ada@example.com');

    expect(result).toEqual({
      slackUserId: 'U1',
      slackTeamId: 'T1',
      displayName: 'Ada Lovelace',
    });
  });

  it('should return undefined when the email is not in the workspace', async () => {
    lookupByEmailMock.mockRejectedValue({ data: { error: 'users_not_found' } });

    const result = await resolveSlackUserByEmail(
      slackClient,
      'guest@example.com',
    );

    expect(result).toBeUndefined();
  });

  it('should rethrow a transient Slack error instead of reporting not found', async () => {
    lookupByEmailMock.mockRejectedValue({ data: { error: 'ratelimited' } });

    await expect(
      resolveSlackUserByEmail(slackClient, 'ada@example.com'),
    ).rejects.toEqual({ data: { error: 'ratelimited' } });
  });
});
