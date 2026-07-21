import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import processRecallWebhookLogicFunction, {
  processRecallWebhookHandler,
} from 'src/logic-functions/process-recall-webhook';

const queryMock = vi.hoisted(() => vi.fn());
const mutationMock = vi.hoisted(() => vi.fn());
const requestArtifactImportMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    query = queryMock;
    mutation = mutationMock;
  },
}));

vi.mock(
  'src/logic-functions/data/request-call-recording-artifacts-import.util',
  () => ({
    requestCallRecordingArtifactsImport: requestArtifactImportMock,
  }),
);

const buildRecordingDoneWebhookBody = () => ({
  event: 'recording.done',
  data: {
    bot: {
      id: 'recall-bot-1',
      metadata: {
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
      updateCallRecording: { id: 'call-recording-1' },
    });
    requestArtifactImportMock.mockReset();
    requestArtifactImportMock.mockResolvedValue(true);
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
            filter: { id: { eq: 'call-recording-1' } },
          }),
        }),
      }),
    );
    expect(mutationMock).toHaveBeenCalledTimes(1);
    expect(mutationMock).toHaveBeenCalledWith({
      updateCallRecording: {
        __args: {
          id: 'call-recording-1',
          data: {
            externalBotId: 'recall-bot-1',
            externalRecordingId: 'recall-recording-1',
            status: 'PROCESSING',
          },
        },
        id: true,
      },
    });
    expect(requestArtifactImportMock).toHaveBeenCalledWith(
      expect.objectContaining({ callRecordingId: 'call-recording-1' }),
    );
    expect(result).toEqual({
      status: 'updated',
      event: 'recording.done',
      callRecordingId: 'call-recording-1',
      callRecordingStatus: 'PROCESSING',
    });
  });
});
