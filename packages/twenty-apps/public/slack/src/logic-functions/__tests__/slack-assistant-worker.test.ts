import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';
import { slackAssistantWorkerDrainHandler } from 'src/logic-functions/slack-assistant-worker';

const { slackAssistantWorkerHandlerMock } = vi.hoisted(() => ({
  slackAssistantWorkerHandlerMock: vi.fn(),
}));

vi.mock('src/logic-functions/handlers/slack-assistant-worker-handler', () => ({
  slackAssistantWorkerHandler: slackAssistantWorkerHandlerMock,
}));

type SlackAssistantRequestCreatedEvent = Parameters<
  typeof slackAssistantWorkerDrainHandler
>[0];

const PENDING_REQUEST = {
  id: 'request-1',
  status: SLACK_ASSISTANT_REQUEST_STATUS.PENDING,
  slackChannelId: 'D123',
  slackMessageTimestamp: '1700000000.000100',
  requestText: 'how many open deals does Acme have?',
};

describe('slackAssistantWorkerDrainHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should hand the created record to the claim-based worker', async () => {
    slackAssistantWorkerHandlerMock.mockResolvedValue({
      skipped: true,
      reason: 'Request is already being processed',
    });

    const result = await slackAssistantWorkerDrainHandler({
      name: 'slackAssistantRequest.created',
      workspaceId: 'workspace-1',
      objectMetadata: { nameSingular: 'slackAssistantRequest' },
      properties: { after: PENDING_REQUEST },
    } as SlackAssistantRequestCreatedEvent);

    expect(slackAssistantWorkerHandlerMock).toHaveBeenCalledExactlyOnceWith(
      PENDING_REQUEST,
    );
    expect(result).toEqual({
      skipped: true,
      reason: 'Request is already being processed',
    });
  });
});
