import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SLACK_USER_LINK_CONSENT_ACTION_ID } from 'src/logic-functions/constants/slack-user-link-consent-action-id';
import { slackUserLinkConsentHandler } from 'src/logic-functions/handlers/slack-user-link-consent-handler';
import { type SlackInteractivityPayload } from 'src/logic-functions/types/slack-interactivity-payload.type';

const {
  coreApiClientMock,
  findSlackUserLinkMock,
  updateSlackUserLinkMock,
  updateSlackMessageViaResponseUrlMock,
} = vi.hoisted(() => ({
  coreApiClientMock: vi.fn(),
  findSlackUserLinkMock: vi.fn(),
  updateSlackUserLinkMock: vi.fn(),
  updateSlackMessageViaResponseUrlMock: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: coreApiClientMock,
}));

vi.mock('src/logic-functions/data/find-slack-user-link', () => ({
  findSlackUserLink: findSlackUserLinkMock,
}));

vi.mock('src/logic-functions/data/update-slack-user-link', () => ({
  updateSlackUserLink: updateSlackUserLinkMock,
}));

vi.mock('src/logic-functions/utils/update-slack-message-via-response-url', () => ({
  updateSlackMessageViaResponseUrl: updateSlackMessageViaResponseUrlMock,
}));

const buildPayload = (
  decision: 'APPROVE' | 'DECLINE',
  overrides: { userId?: string; teamId?: string; workspaceMemberId?: string } = {},
): SlackInteractivityPayload => ({
  type: 'block_actions',
  team: { id: overrides.teamId ?? 'T1' },
  user: { id: overrides.userId ?? 'U1' },
  response_url: 'https://hooks.slack.test/1',
  actions: [
    {
      action_id: `${SLACK_USER_LINK_CONSENT_ACTION_ID}:${decision.toLowerCase()}`,
      block_id: SLACK_USER_LINK_CONSENT_ACTION_ID,
      value: JSON.stringify({
        decision,
        slackTeamId: 'T1',
        slackUserId: 'U1',
        workspaceMemberId: overrides.workspaceMemberId ?? 'member-1',
      }),
    },
  ],
});

describe('slackUserLinkConsentHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    coreApiClientMock.mockImplementation(function () {
      return {};
    });
    findSlackUserLinkMock.mockResolvedValue({
      id: 'link-1',
      workspaceMemberId: 'member-1',
      source: 'MANUAL',
      consentState: 'PENDING',
    });
    updateSlackUserLinkMock.mockResolvedValue(undefined);
  });

  it('should activate the link when the invited user approves', async () => {
    const result = await slackUserLinkConsentHandler(buildPayload('APPROVE'));

    expect(result).toEqual({ done: true });
    expect(updateSlackUserLinkMock).toHaveBeenCalledTimes(1);
    expect(updateSlackUserLinkMock).toHaveBeenCalledWith(expect.anything(), {
      id: 'link-1',
      consentState: 'ACTIVE',
    });
    expect(updateSlackMessageViaResponseUrlMock).toHaveBeenCalledTimes(1);
  });

  it('should ignore a decision that targets a superseded member assignment', async () => {
    const result = await slackUserLinkConsentHandler(
      buildPayload('APPROVE', { workspaceMemberId: 'member-old' }),
    );

    expect(result).toMatchObject({ skipped: true });
    expect(updateSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should decline the link when the invited user declines', async () => {
    const result = await slackUserLinkConsentHandler(buildPayload('DECLINE'));

    expect(result).toEqual({ done: true });
    expect(updateSlackUserLinkMock).toHaveBeenCalledWith(expect.anything(), {
      id: 'link-1',
      consentState: 'DECLINED',
    });
  });

  it('should ignore a decision from a different Slack user', async () => {
    const result = await slackUserLinkConsentHandler(
      buildPayload('APPROVE', { userId: 'U-someone-else' }),
    );

    expect(result).toMatchObject({ skipped: true });
    expect(updateSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should ignore a decision from a different Slack workspace', async () => {
    const result = await slackUserLinkConsentHandler(
      buildPayload('APPROVE', { teamId: 'T-other' }),
    );

    expect(result).toMatchObject({ skipped: true });
    expect(updateSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should not transition a link that is no longer pending', async () => {
    findSlackUserLinkMock.mockResolvedValue({
      id: 'link-1',
      workspaceMemberId: 'member-1',
      source: 'MANUAL',
      consentState: 'ACTIVE',
    });

    const result = await slackUserLinkConsentHandler(buildPayload('APPROVE'));

    expect(result).toMatchObject({ skipped: true });
    expect(updateSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should skip when there is no link for the Slack user', async () => {
    findSlackUserLinkMock.mockResolvedValue(undefined);

    const result = await slackUserLinkConsentHandler(buildPayload('APPROVE'));

    expect(result).toMatchObject({ skipped: true });
    expect(updateSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should skip when there is no consent action in the payload', async () => {
    const result = await slackUserLinkConsentHandler({
      type: 'block_actions',
      team: { id: 'T1' },
      user: { id: 'U1' },
      actions: [{ action_id: 'something-else' }],
    });

    expect(result).toMatchObject({ skipped: true });
  });
});
