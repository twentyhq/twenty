import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  SLACK_ASSISTANT_FEEDBACK_UNIVERSAL_IDENTIFIER,
  SLACK_USER_LINK_CONSENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { SLACK_ASSISTANT_FEEDBACK_ACTION_ID } from 'src/logic-functions/constants/slack-assistant-feedback-action-id';
import { SLACK_USER_LINK_CONSENT_ACTION_ID } from 'src/logic-functions/constants/slack-user-link-consent-action-id';
import { slackInteractivityResolverHandler } from 'src/logic-functions/handlers/slack-interactivity-resolver-handler';
import { type SlackInteractivityPayload } from 'src/logic-functions/types/slack-interactivity-payload.type';

const { parsePayloadMock, resolveTargetWorkspaceIdMock } = vi.hoisted(() => ({
  parsePayloadMock: vi.fn(),
  resolveTargetWorkspaceIdMock: vi.fn(),
}));

vi.mock(
  'src/logic-functions/utils/verify-slack-webhook-request-or-throw',
  () => ({
    verifySlackWebhookRequestOrThrow: vi.fn(),
  }),
);

vi.mock(
  'src/logic-functions/utils/parse-slack-interactivity-payload-or-throw',
  () => ({
    parseSlackInteractivityPayloadOrThrow: parsePayloadMock,
  }),
);

vi.mock('src/logic-functions/utils/resolve-target-workspace-id', () => ({
  resolveTargetWorkspaceId: resolveTargetWorkspaceIdMock,
}));

const routePayload = {
  body: {},
  headers: {},
  queryStringParameters: {},
  pathParameters: {},
  isBase64Encoded: false,
  requestContext: {
    http: { method: 'POST', path: '/s/slack-interactivity' },
  },
  userWorkspaceId: 'workspace-1',
};

const run = async (payload: SlackInteractivityPayload) => {
  parsePayloadMock.mockReturnValue(payload);

  return slackInteractivityResolverHandler(routePayload);
};

describe('slackInteractivityResolverHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resolveTargetWorkspaceIdMock.mockResolvedValue('workspace-1');
  });

  it('should route a feedback action to the feedback function', async () => {
    const result = await run({
      type: 'block_actions',
      team: { id: 'T1' },
      actions: [{ action_id: SLACK_ASSISTANT_FEEDBACK_ACTION_ID }],
    });

    expect(result).toMatchObject({
      targetLogicFunctionUniversalIdentifier:
        SLACK_ASSISTANT_FEEDBACK_UNIVERSAL_IDENTIFIER,
    });
  });

  it('should route a consent action to the consent function', async () => {
    const result = await run({
      type: 'block_actions',
      team: { id: 'T1' },
      actions: [{ action_id: `${SLACK_USER_LINK_CONSENT_ACTION_ID}:approve` }],
    });

    expect(result).toMatchObject({
      targetLogicFunctionUniversalIdentifier:
        SLACK_USER_LINK_CONSENT_UNIVERSAL_IDENTIFIER,
    });
  });

  it('should acknowledge an unrelated action without routing', async () => {
    const result = await run({
      type: 'block_actions',
      team: { id: 'T1' },
      actions: [{ action_id: 'unrelated' }],
    });

    expect(result).not.toHaveProperty('targetLogicFunctionUniversalIdentifier');
  });

  it('should acknowledge a non block_actions payload', async () => {
    const result = await run({ type: 'view_submission' });

    expect(result).not.toHaveProperty('targetLogicFunctionUniversalIdentifier');
  });
});
