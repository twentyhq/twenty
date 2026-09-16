import { beforeEach, expect, it, vi } from 'vitest';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { handleRecallWebhook } from '../handle-recall-webhook.util';

const { enqueue, ownedUpload } = vi.hoisted(() => ({
  enqueue: vi.fn(),
  ownedUpload: vi.fn(),
}));
vi.mock('src/logic-functions/recall-api/get-owned-desktop-upload.util', () => ({
  getOwnedDesktopUpload: ownedUpload,
}));
vi.mock(
  'src/logic-functions/data/enqueue-call-recording-artifacts-import.util',
  () => ({ enqueueCallRecordingArtifactsImport: enqueue }),
);
const query = vi.fn();
const mutation = vi.fn();
const client = { query, mutation } as unknown as CoreApiClient;
const session = {
  source: 'desktop',
  media: 'audio',
  userWorkspaceId: 'owner',
  sdkUploadId: 'upload-1',
};
const webhook = (event: string, source = 'companion') => ({
  event,
  data: {
    sdk_upload: {
      id: 'upload-1',
      metadata: {
        twentyRecordingSource: source,
        twentyCallRecordingId: 'recording-1',
      },
    },
    recording: { id: 'recall-1' },
  },
});
beforeEach(() => {
  vi.clearAllMocks();
  ownedUpload.mockResolvedValue({
    id: 'upload-1',
    recording_id: 'recall-1',
    status: { code: 'complete' },
  });
  query.mockResolvedValue({
    callRecordings: {
      edges: [
        {
          node: {
            id: 'recording-1',
            status: 'JOINING',
            companionSession: session,
          },
        },
      ],
    },
  });
  mutation.mockResolvedValue({ updateCallRecordings: [{ id: 'recording-1' }] });
});

it('ignores another app before looking up or changing its records', async () => {
  expect(
    await handleRecallWebhook({
      client,
      body: webhook('sdk_upload.complete', 'call-recorder'),
    }),
  ).toMatchObject({ status: 'skipped' });
  expect(query).not.toHaveBeenCalled();
  expect(mutation).not.toHaveBeenCalled();
  expect(enqueue).not.toHaveBeenCalled();
});

it('rejects metadata pointing at a record not owned by Companion', async () => {
  query.mockResolvedValue({
    callRecordings: {
      edges: [{ node: { id: 'recording-1', status: 'RECORDING' } }],
    },
  });
  expect(
    await handleRecallWebhook({ client, body: webhook('sdk_upload.complete') }),
  ).toMatchObject({ status: 'skipped', reason: 'no matching call recording' });
  expect(mutation).not.toHaveBeenCalled();
  expect(enqueue).not.toHaveBeenCalled();
});

it.each([
  ['sdk_upload.recording_started', 'RECORDING'],
  ['sdk_upload.recording_ended', 'PROCESSING'],
  ['sdk_upload.complete', 'PROCESSING'],
  ['sdk_upload.failed', 'FAILED'],
])('handles %s on a Companion session', async (event, status) => {
  expect(
    await handleRecallWebhook({ client, body: webhook(event) }),
  ).toMatchObject({ status: 'updated', callRecordingStatus: status });
  expect(mutation).toHaveBeenCalledWith(
    expect.objectContaining({
      updateCallRecordings: expect.objectContaining({
        __args: expect.objectContaining({
          data: expect.objectContaining({ status }),
        }),
      }),
    }),
  );
  if (event === 'sdk_upload.complete') expect(enqueue).toHaveBeenCalledOnce();
  else expect(enqueue).not.toHaveBeenCalled();
});

it.each(['transcript.done', 'transcript.failed'])(
  'queues %s through the durable importer',
  async (event) => {
    expect(
      await handleRecallWebhook({ client, body: webhook(event) }),
    ).toMatchObject({ status: 'queued' });
    expect(enqueue).toHaveBeenCalledWith({ callRecordingId: 'recording-1' });
    expect(mutation).not.toHaveBeenCalled();
  },
);

it('does not enqueue an import after losing a race with completion', async () => {
  mutation.mockResolvedValue({ updateCallRecordings: [] });
  expect(
    await handleRecallWebhook({ client, body: webhook('sdk_upload.complete') }),
  ).toMatchObject({ status: 'skipped' });
  expect(enqueue).not.toHaveBeenCalled();
});

it('rejects a webhook recording ID that differs from the provider upload', async () => {
  ownedUpload.mockResolvedValue({
    id: 'upload-1',
    recording_id: 'another-recording',
  });
  expect(
    await handleRecallWebhook({ client, body: webhook('sdk_upload.complete') }),
  ).toMatchObject({ status: 'skipped' });
  expect(mutation).not.toHaveBeenCalled();
  expect(enqueue).not.toHaveBeenCalled();
});
