import { type WebClient } from '@slack/web-api';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { resolveSlackUserLinkTarget } from 'src/logic-functions/utils/resolve-slack-user-link-target';

const INSTALLED_TEAM_ID = 'T0INSTALLED';
const OTHER_TEAM_ID = 'T0CONNECTED';
const SLACK_USER_ID = 'U0123456789';
const EMAIL = 'ada@twenty.com';

const userInfoMock = vi.fn();
const lookupByEmailMock = vi.fn();

const slackClient = {
  users: { info: userInfoMock, lookupByEmail: lookupByEmailMock },
} as unknown as WebClient;

const buildSlackUser = (overrides: Record<string, unknown> = {}) => ({
  id: SLACK_USER_ID,
  team_id: INSTALLED_TEAM_ID,
  real_name: 'Ada Lovelace',
  is_email_confirmed: true,
  profile: { email: EMAIL },
  ...overrides,
});

const resolveTarget = (
  overrides: {
    requestedSlackUserId?: string;
    email?: string;
    requestedSlackTeamId?: string;
    requestedName?: string;
  } = {},
) =>
  resolveSlackUserLinkTarget({
    slackClient,
    requestedSlackUserId: undefined,
    email: undefined,
    requestedSlackTeamId: undefined,
    requestedName: undefined,
    installedSlackTeamId: INSTALLED_TEAM_ID,
    ...overrides,
  });

describe('resolveSlackUserLinkTarget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userInfoMock.mockResolvedValue({ user: buildSlackUser() });
    lookupByEmailMock.mockResolvedValue({ user: buildSlackUser() });
  });

  it('should resolve by Slack user id and carry the team Slack reports', async () => {
    expect(
      await resolveTarget({ requestedSlackUserId: SLACK_USER_ID }),
    ).toMatchObject({
      success: true,
      slackUserId: SLACK_USER_ID,
      slackTeamId: INSTALLED_TEAM_ID,
      name: 'Ada Lovelace',
    });
  });

  it('should prefer the Slack user id over the email when both are given', async () => {
    await resolveTarget({ requestedSlackUserId: SLACK_USER_ID, email: EMAIL });

    expect(lookupByEmailMock).not.toHaveBeenCalled();
  });

  it('should keep an explicitly requested name over the Slack display name', async () => {
    expect(
      await resolveTarget({
        requestedSlackUserId: SLACK_USER_ID,
        requestedName: 'Ada from support',
      }),
    ).toMatchObject({ name: 'Ada from support' });
  });

  it('should refuse a team id that contradicts the one Slack reports', async () => {
    expect(
      await resolveTarget({
        requestedSlackUserId: SLACK_USER_ID,
        requestedSlackTeamId: OTHER_TEAM_ID,
      }),
    ).toMatchObject({
      success: false,
      message: 'Slack team id does not match the user',
    });
  });

  it('should refuse an unverifiable foreign team id when Slack resolved the user without one', async () => {
    userInfoMock.mockResolvedValue({ user: buildSlackUser({ team_id: '' }) });

    expect(
      await resolveTarget({
        requestedSlackUserId: SLACK_USER_ID,
        requestedSlackTeamId: OTHER_TEAM_ID,
      }),
    ).toMatchObject({
      success: false,
      message: 'Could not verify the Slack workspace for that user',
    });
  });

  it('should accept the installed team id when Slack resolved the user without one', async () => {
    userInfoMock.mockResolvedValue({ user: buildSlackUser({ team_id: '' }) });

    expect(
      await resolveTarget({
        requestedSlackUserId: SLACK_USER_ID,
        requestedSlackTeamId: INSTALLED_TEAM_ID,
      }),
    ).toMatchObject({ success: true, slackTeamId: INSTALLED_TEAM_ID });
  });

  it('should accept a foreign team id for an account Slack cannot see at all', async () => {
    userInfoMock.mockResolvedValue(undefined);

    expect(
      await resolveTarget({
        requestedSlackUserId: SLACK_USER_ID,
        requestedSlackTeamId: OTHER_TEAM_ID,
      }),
    ).toMatchObject({ success: true, slackTeamId: OTHER_TEAM_ID });
  });

  it('should refuse an id Slack cannot resolve that claims the installed workspace', async () => {
    userInfoMock.mockResolvedValue(undefined);

    expect(
      await resolveTarget({
        requestedSlackUserId: SLACK_USER_ID,
        requestedSlackTeamId: INSTALLED_TEAM_ID,
      }),
    ).toMatchObject({
      success: false,
      message: 'Could not verify the Slack user in your workspace',
    });
  });

  it('should resolve by email and default to the installed workspace', async () => {
    lookupByEmailMock.mockResolvedValue({
      user: buildSlackUser({ team_id: '' }),
    });

    expect(await resolveTarget({ email: EMAIL })).toMatchObject({
      success: true,
      slackUserId: SLACK_USER_ID,
      slackTeamId: INSTALLED_TEAM_ID,
    });
  });

  it('should refuse an unverifiable foreign team id on the email path', async () => {
    lookupByEmailMock.mockResolvedValue({
      user: buildSlackUser({ team_id: '' }),
    });

    expect(
      await resolveTarget({
        email: EMAIL,
        requestedSlackTeamId: OTHER_TEAM_ID,
      }),
    ).toMatchObject({
      success: false,
      message: 'Could not verify the Slack workspace for that user',
    });
  });

  it('should report missing input when neither a Slack user id nor an email is given', async () => {
    expect(await resolveTarget()).toMatchObject({
      success: false,
      message: 'Missing required fields',
    });
  });
});
