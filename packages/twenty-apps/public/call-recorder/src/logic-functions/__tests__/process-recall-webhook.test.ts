import { beforeEach, describe, expect, it, vi } from 'vitest';

import processRecallWebhookLogicFunction, {
  processRecallWebhookHandler,
} from 'src/logic-functions/process-recall-webhook';

const handleRecallWebhookMock = vi.hoisted(() => vi.fn());
const coreApiClientMock = vi.hoisted(() => vi.fn());

vi.mock('src/logic-functions/flows/handle-recall-webhook.util', () => ({
  handleRecallWebhook: handleRecallWebhookMock,
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: coreApiClientMock,
}));

const buildRecordingDoneWebhookBody = () => ({
  event: 'recording.done',
  data: {
    bot: {
      id: 'recall-bot-1',
      metadata: { twentyWorkspaceId: '123e4567-e89b-12d3-a456-426614174000' },
    },
    recording: { id: 'recall-recording-1' },
  },
});

describe('process-recall-webhook', () => {
  beforeEach(() => {
    handleRecallWebhookMock.mockReset();
    handleRecallWebhookMock.mockResolvedValue({ status: 'updated' });
    coreApiClientMock.mockReset();
  });

  it('declares no external trigger so it only runs when dispatched by the resolver', () => {
    expect(processRecallWebhookLogicFunction.success).toBe(true);
    expect(
      processRecallWebhookLogicFunction.config.serverRouteTriggerSettings,
    ).toBeUndefined();
    expect(
      processRecallWebhookLogicFunction.config.httpRouteTriggerSettings,
    ).toBeUndefined();
  });

  it('forwards the resolved payload to handleRecallWebhook with a workspace-scoped client', async () => {
    const body = buildRecordingDoneWebhookBody();

    const result = await processRecallWebhookHandler(body);

    expect(coreApiClientMock).toHaveBeenCalledTimes(1);
    expect(handleRecallWebhookMock).toHaveBeenCalledTimes(1);
    expect(handleRecallWebhookMock).toHaveBeenCalledWith({
      client: coreApiClientMock.mock.instances[0],
      body,
    });
    expect(result).toEqual({ status: 'updated' });
  });
});
