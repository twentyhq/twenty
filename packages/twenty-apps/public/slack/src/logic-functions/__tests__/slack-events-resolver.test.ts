import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  SLACK_EVENTS_ENQUEUE_UNIVERSAL_IDENTIFIER,
  SLACK_INSTALL_REVOKED_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { slackEventsResolverHandler } from 'src/logic-functions/slack-events-resolver';
import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';
import { Response } from 'twenty-sdk/logic-function';

const { getSlackWebhookSecretMock, verifySignatureMock, resolveWorkspaceMock } =
  vi.hoisted(() => ({
    getSlackWebhookSecretMock: vi.fn(),
    verifySignatureMock: vi.fn(),
    resolveWorkspaceMock: vi.fn(),
  }));

vi.mock('src/logic-functions/utils/get-slack-webhook-secret', () => ({
  getSlackWebhookSecret: getSlackWebhookSecretMock,
}));

vi.mock('src/logic-functions/utils/verify-slack-request-signature', () => ({
  verifySlackRequestSignature: verifySignatureMock,
}));

vi.mock('src/logic-functions/utils/resolve-target-workspace-id', () => ({
  resolveTargetWorkspaceId: resolveWorkspaceMock,
}));

const buildRoutePayload = (body: SlackEventsRequestBody) => ({
  body,
  rawBody: JSON.stringify(body),
  headers: {
    'x-slack-signature': 'v0=signature',
    'x-slack-request-timestamp': '1700000000',
  },
  queryStringParameters: {},
  pathParameters: {},
  isBase64Encoded: false,
  requestContext: { http: { method: 'POST', path: '/' } },
  userWorkspaceId: null,
});

describe('slackEventsResolverHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSlackWebhookSecretMock.mockReturnValue({
      success: true,
      secret: 'secret',
    });
    verifySignatureMock.mockReturnValue(true);
  });

  it('should route app_uninstalled to the install-revoked function in the claimed workspace', async () => {
    resolveWorkspaceMock.mockResolvedValue('workspace-1');

    const body: SlackEventsRequestBody = {
      type: 'event_callback',
      team_id: 'T123',
      event: { type: 'app_uninstalled' },
    };

    const result = await slackEventsResolverHandler(buildRoutePayload(body));

    expect(result).toEqual({
      workspaceId: 'workspace-1',
      targetLogicFunctionUniversalIdentifier:
        SLACK_INSTALL_REVOKED_UNIVERSAL_IDENTIFIER,
      payload: body,
    });
  });

  it('should route tokens_revoked to the install-revoked function', async () => {
    resolveWorkspaceMock.mockResolvedValue('workspace-1');

    const body: SlackEventsRequestBody = {
      type: 'event_callback',
      team_id: 'T123',
      event: { type: 'tokens_revoked', tokens: { bot: ['B123'] } },
    };

    const result = await slackEventsResolverHandler(buildRoutePayload(body));

    expect(result).toMatchObject({
      targetLogicFunctionUniversalIdentifier:
        SLACK_INSTALL_REVOKED_UNIVERSAL_IDENTIFIER,
    });
  });

  it('should ack a removal event for an unclaimed team instead of erroring into a retry', async () => {
    resolveWorkspaceMock.mockRejectedValue(
      new Error('No workspace has claimed Slack team T123'),
    );

    const result = await slackEventsResolverHandler(
      buildRoutePayload({
        type: 'event_callback',
        team_id: 'T123',
        event: { type: 'tokens_revoked', tokens: { bot: ['B123'] } },
      }),
    );

    expect(result).toBeInstanceOf(Response);
    expect((result as Response).body).toEqual({
      ok: true,
      skipped: 'No workspace claims this Slack team',
    });
  });

  it('should keep failing loudly when a message event targets an unclaimed team', async () => {
    resolveWorkspaceMock.mockRejectedValue(
      new Error('No workspace has claimed Slack team T123'),
    );

    await expect(
      slackEventsResolverHandler(
        buildRoutePayload({
          type: 'event_callback',
          team_id: 'T123',
          event: { type: 'message', channel_type: 'im' },
        }),
      ),
    ).rejects.toThrow('No workspace has claimed Slack team T123');
  });

  it('should route other events unchanged', async () => {
    resolveWorkspaceMock.mockResolvedValue('workspace-1');

    const result = await slackEventsResolverHandler(
      buildRoutePayload({
        type: 'event_callback',
        team_id: 'T123',
        event: { type: 'message', channel_type: 'im' },
      }),
    );

    expect(result).toMatchObject({
      targetLogicFunctionUniversalIdentifier:
        SLACK_EVENTS_ENQUEUE_UNIVERSAL_IDENTIFIER,
    });
  });
});
