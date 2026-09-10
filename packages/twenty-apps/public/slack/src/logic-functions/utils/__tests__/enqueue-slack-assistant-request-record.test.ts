import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';
import { SLACK_ASSISTANT_REQUEST_TIMEOUT_SECONDS } from 'src/logic-functions/constants/slack-assistant-request-timeout-seconds';
import { enqueueSlackAssistantRequestRecord } from 'src/logic-functions/utils/enqueue-slack-assistant-request-record';

const {
  coreApiClientMock,
  findSlackAssistantRequestBySlackMessageMock,
  createSlackAssistantRequestMock,
} = vi.hoisted(() => ({
  coreApiClientMock: vi.fn(),
  findSlackAssistantRequestBySlackMessageMock: vi.fn(),
  createSlackAssistantRequestMock: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: coreApiClientMock,
}));

vi.mock(
  'src/logic-functions/data/find-slack-assistant-request-by-slack-message',
  () => ({
    findSlackAssistantRequestBySlackMessage:
      findSlackAssistantRequestBySlackMessageMock,
  }),
);

vi.mock('src/logic-functions/data/create-slack-assistant-request', () => ({
  createSlackAssistantRequest: createSlackAssistantRequestMock,
}));

const REQUEST_DRAFT = {
  slackEventId: 'Ev123',
  slackChannelId: 'D123',
  slackChannelType: 'im',
  slackThreadTimestamp: '',
  slackMessageTimestamp: '1700000000.000100',
  slackUserId: 'U123',
  requestText: 'how many open deals does Acme have?',
};

describe('enqueueSlackAssistantRequestRecord', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    coreApiClientMock.mockImplementation(function () {
      return {};
    });
  });

  it('should record a new request as pending and hand it back', async () => {
    findSlackAssistantRequestBySlackMessageMock.mockResolvedValue(undefined);
    createSlackAssistantRequestMock.mockResolvedValue('request-1');

    const result = await enqueueSlackAssistantRequestRecord(REQUEST_DRAFT);

    expect(result).toEqual({
      ok: true,
      request: {
        id: 'request-1',
        status: SLACK_ASSISTANT_REQUEST_STATUS.PENDING,
        slackChannelId: 'D123',
        slackChannelType: 'im',
        slackThreadTimestamp: '',
        slackMessageTimestamp: '1700000000.000100',
        slackUserId: 'U123',
        requestText: 'how many open deals does Acme have?',
      },
    });
  });

  it('should hand back an unanswered request so a retry can resume it', async () => {
    const pendingRequest = {
      id: 'request-1',
      status: SLACK_ASSISTANT_REQUEST_STATUS.PENDING,
      ...REQUEST_DRAFT,
    };

    findSlackAssistantRequestBySlackMessageMock.mockResolvedValue(
      pendingRequest,
    );

    const result = await enqueueSlackAssistantRequestRecord(REQUEST_DRAFT);

    expect(result).toEqual({ ok: true, request: pendingRequest });
    expect(createSlackAssistantRequestMock).not.toHaveBeenCalled();
  });

  it('should skip a request another execution is already answering', async () => {
    findSlackAssistantRequestBySlackMessageMock.mockResolvedValue({
      id: 'request-1',
      status: SLACK_ASSISTANT_REQUEST_STATUS.PROCESSING,
      updatedAt: new Date().toISOString(),
      ...REQUEST_DRAFT,
    });

    const result = await enqueueSlackAssistantRequestRecord(REQUEST_DRAFT);

    expect(result).toEqual({
      ok: true,
      skipped: 'Slack message is already queued',
    });
  });

  it('should hand back a request whose execution died mid-answer', async () => {
    const staleRequest = {
      id: 'request-1',
      status: SLACK_ASSISTANT_REQUEST_STATUS.PROCESSING,
      updatedAt: new Date(
        Date.now() - (SLACK_ASSISTANT_REQUEST_TIMEOUT_SECONDS + 1) * 1000,
      ).toISOString(),
      ...REQUEST_DRAFT,
    };

    findSlackAssistantRequestBySlackMessageMock.mockResolvedValue(staleRequest);

    const result = await enqueueSlackAssistantRequestRecord(REQUEST_DRAFT);

    expect(result).toEqual({ ok: true, request: staleRequest });
  });

  it('should hand back the winning record when losing the create race', async () => {
    const pendingRequest = {
      id: 'request-1',
      status: SLACK_ASSISTANT_REQUEST_STATUS.PENDING,
      ...REQUEST_DRAFT,
    };

    findSlackAssistantRequestBySlackMessageMock
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(pendingRequest);
    createSlackAssistantRequestMock.mockRejectedValue(
      new Error('duplicate key value violates unique constraint'),
    );

    const result = await enqueueSlackAssistantRequestRecord(REQUEST_DRAFT);

    expect(result).toEqual({ ok: true, request: pendingRequest });
    expect(findSlackAssistantRequestBySlackMessageMock).toHaveBeenCalledTimes(
      2,
    );
  });
});
