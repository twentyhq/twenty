import { createHmac } from 'crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import processRecallWebhookLogicFunction, {
  processRecallWebhookHandler,
} from 'src/logic-functions/process-recall-webhook';

const queryMock = vi.hoisted(() => vi.fn());
const mutationMock = vi.hoisted(() => vi.fn());
const enqueueArtifactImportMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    query = queryMock;
    mutation = mutationMock;
  },
}));

vi.mock(
  'src/logic-functions/data/enqueue-call-recording-artifacts-import.util',
  () => ({
    enqueueCallRecordingArtifactsImport: enqueueArtifactImportMock,
  }),
);

const SECRET = 'whsec_' + Buffer.from('test-secret').toString('base64');
vi.mock(
  'src/logic-functions/utils/get-application-variable-value.util',
  () => ({
    getApplicationVariableValue: () =>
      'whsec_' + Buffer.from('test-secret').toString('base64'),
  }),
);
vi.mock('src/logic-functions/data/get-current-workspace-id.util', () => ({
  getCurrentWorkspaceId: () => '123e4567-e89b-12d3-a456-426614174000',
}));
vi.mock('src/logic-functions/recall-api/get-owned-desktop-upload.util', () => ({
  getOwnedDesktopUpload: async () => ({
    id: 'upload-1',
    recording_id: 'recall-recording-1',
    status: { code: 'complete' },
  }),
}));
const signed = (body: object) => {
  const rawBody = JSON.stringify(body);
  const timestamp = String(Math.floor(Date.now() / 1000));
  return {
    rawBody,
    headers: {
      'webhook-id': 'test-message',
      'webhook-timestamp': timestamp,
      'webhook-signature':
        'v1,' +
        createHmac('sha256', Buffer.from(SECRET.slice(6), 'base64'))
          .update(`test-message.${timestamp}.${rawBody}`)
          .digest('base64'),
    },
  };
};
const buildRecordingDoneWebhookBody = () =>
  signed({
    event: 'recording.done',
    data: {
      bot: {
        id: 'recall-bot-1',
        metadata: {
          twentyRecordingSource: 'companion',
          twentyWorkspaceId: '123e4567-e89b-12d3-a456-426614174000',
          twentyCallRecordingId: 'call-recording-1',
        },
      },
      recording: { id: 'recall-recording-1' },
    },
  });

describe('process-recall-webhook', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    queryMock.mockReset();
    queryMock.mockResolvedValue({
      callRecordings: {
        edges: [
          {
            node: {
              companionSession: { source: 'desktop', media: 'audio' },
              id: 'call-recording-1',
              status: 'PROCESSING',
              externalRecordingId: 'recall-recording-1',
              transcript: [
                {
                  participant: { name: 'Ada' },
                  words: [
                    { text: 'Hello world', start_timestamp: { relative: 0 } },
                  ],
                },
              ],
              audio: [{ fileId: 'file-audio-1' }],
              video: [{ fileId: 'file-video-1' }],
            },
          },
        ],
      },
    });
    mutationMock.mockReset();
    mutationMock.mockResolvedValue({
      updateCallRecordings: [{ id: 'call-recording-1' }],
    });
    enqueueArtifactImportMock.mockReset();
    enqueueArtifactImportMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('declares no external trigger so it only runs when dispatched by the resolver', () => {
    expect(processRecallWebhookLogicFunction.success).toBe(true);
    expect(
      'serverRouteTriggerSettings' in processRecallWebhookLogicFunction.config,
    ).toBe(false);
    expect(
      processRecallWebhookLogicFunction.config.httpRouteTriggerSettings,
    ).toBeUndefined();
  });

  it('forwards the resolved payload to handleRecallWebhook with a workspace-scoped client', async () => {
    const body = buildRecordingDoneWebhookBody();

    const result = await processRecallWebhookHandler(body);

    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(queryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        callRecordings: expect.objectContaining({
          __args: expect.objectContaining({
            filter: {
              and: [
                { id: { eq: 'call-recording-1' } },
                { companionSession: { is: 'NOT_NULL' } },
              ],
            },
          }),
        }),
      }),
    );
    expect(mutationMock).toHaveBeenCalledTimes(1);
    expect(mutationMock).toHaveBeenCalledWith({
      updateCallRecordings: {
        __args: {
          filter: {
            id: { eq: 'call-recording-1' },
            status: { in: ['SCHEDULED', 'JOINING', 'RECORDING', 'PROCESSING'] },
          },
          data: {
            externalBotId: 'recall-bot-1',
            externalRecordingId: 'recall-recording-1',
            status: 'PROCESSING',
          },
        },
        id: true,
      },
    });
    expect(enqueueArtifactImportMock).toHaveBeenCalledWith(
      expect.objectContaining({ callRecordingId: 'call-recording-1' }),
    );
    expect(result).toEqual({
      status: 'updated',
      event: 'recording.done',
      callRecordingId: 'call-recording-1',
      callRecordingStatus: 'PROCESSING',
    });
  });

  it('preserves processing errors without inventing a retry classification', async () => {
    enqueueArtifactImportMock.mockRejectedValue(
      new Error('Service unavailable'),
    );

    await expect(
      processRecallWebhookHandler(buildRecordingDoneWebhookBody()),
    ).rejects.toMatchObject({
      name: 'Error',
      cause: expect.objectContaining({ message: 'Service unavailable' }),
      message: expect.stringContaining('Service unavailable'),
    });
  });
});

it('does not enqueue an import when a status update loses a race with completion', async () => {
  queryMock.mockResolvedValue({
    callRecordings: {
      edges: [
        {
          node: {
            companionSession: { source: 'desktop', media: 'audio' },
            id: 'call-recording-1',
            status: 'PROCESSING',
          },
        },
      ],
    },
  });
  mutationMock.mockResolvedValue({ updateCallRecordings: [] });
  enqueueArtifactImportMock.mockClear();
  expect(
    await processRecallWebhookHandler(buildRecordingDoneWebhookBody()),
  ).toMatchObject({ status: 'skipped', reason: 'recording already advanced' });
  expect(enqueueArtifactImportMock).not.toHaveBeenCalled();
});

it('rejects direct unsigned worker invocation before querying or mutating a record', async () => {
  queryMock.mockClear();
  mutationMock.mockClear();
  enqueueArtifactImportMock.mockClear();
  expect(
    await processRecallWebhookHandler({
      event: 'sdk_upload.complete',
      data: { recording: { id: 'foreign' } },
    }),
  ).toMatchObject({ status: 'skipped', reason: 'unsigned webhook payload' });
  expect(queryMock).not.toHaveBeenCalled();
  expect(mutationMock).not.toHaveBeenCalled();
  expect(enqueueArtifactImportMock).not.toHaveBeenCalled();
});

it('rejects tampering with the queued signed bytes', async () => {
  const envelope = buildRecordingDoneWebhookBody();
  envelope.rawBody = envelope.rawBody.replace('recall-recording-1', 'foreign');
  expect(await processRecallWebhookHandler(envelope)).toMatchObject({
    reason: 'invalid webhook signature',
  });
});

it('rejects a valid signature targeted at another workspace', async () => {
  expect(
    await processRecallWebhookHandler(
      signed({
        event: 'recording.done',
        data: { recording: { metadata: { twentyWorkspaceId: 'other' } } },
      }),
    ),
  ).toMatchObject({ reason: 'webhook workspace mismatch' });
});
