import { beforeEach, expect, it, vi } from 'vitest';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { importCallRecordingArtifacts } from '../import-call-recording-artifacts.util';

const { claim, release, hydrate, sync, ownedUpload } = vi.hoisted(() => ({
  ownedUpload: vi.fn(),
  claim: vi.fn(),
  release: vi.fn(),
  hydrate: vi.fn(),
  sync: vi.fn(),
}));
vi.mock(
  'src/logic-functions/data/claim-call-recording-artifacts-import.util',
  () => ({
    claimCallRecordingArtifactsImport: claim,
    releaseCallRecordingArtifactsImportClaim: release,
  }),
);
vi.mock('src/logic-functions/flows/recover-desktop-recordings.util', () => ({
  hydrateDesktopRecordingTimestamps: hydrate,
}));
vi.mock('src/logic-functions/flows/sync-call-recording.util', () => ({
  syncCallRecording: sync,
}));
vi.mock('src/logic-functions/recall-api/get-owned-desktop-upload.util', () => ({
  getOwnedDesktopUpload: ownedUpload,
}));
const query = vi.fn();
const client = { query } as unknown as CoreApiClient;
const request = {
  callRecordingId: 'recording-1',
  requestedAt: '2026-09-08T10:00:00.000Z',
};

beforeEach(() => {
  vi.resetAllMocks();
  ownedUpload.mockResolvedValue({
    id: 'upload-1',
    recording_id: 'trusted-recall-id',
    status: { code: 'complete' },
  });
  query.mockResolvedValue({
    callRecordings: {
      edges: [
        {
          node: {
            id: request.callRecordingId,
            externalRecordingId: 'trusted-recall-id',
            status: 'PROCESSING',
            companionSession: {
              source: 'desktop',
              media: 'audio',
              userWorkspaceId: 'owner',
              sdkUploadId: 'upload-1',
            },
          },
        },
      ],
    },
  });
  claim.mockResolvedValue(true);
  sync.mockResolvedValue({ updated: true });
});

it('does not import a Call Recorder record even when a job supplies its ID', async () => {
  query.mockResolvedValue({
    callRecordings: {
      edges: [
        {
          node: {
            id: request.callRecordingId,
            externalRecordingId: 'other-recall-id',
          },
        },
      ],
    },
  });
  expect(await importCallRecordingArtifacts({ client, request })).toMatchObject(
    { status: 'skipped' },
  );
  expect(claim).not.toHaveBeenCalled();
  expect(sync).not.toHaveBeenCalled();
});

it('imports the persisted Companion recording under an exclusive lease', async () => {
  expect(await importCallRecordingArtifacts({ client, request })).toMatchObject(
    { status: 'imported' },
  );
  expect(hydrate).toHaveBeenCalledOnce();
  expect(sync).toHaveBeenCalledWith(
    expect.objectContaining({
      callRecording: expect.objectContaining({
        id: request.callRecordingId,
        externalRecordingId: 'trusted-recall-id',
      }),
    }),
  );
  expect(release).toHaveBeenCalledOnce();
});

it('does no provider work when another worker holds the lease', async () => {
  claim.mockResolvedValue(false);
  expect(await importCallRecordingArtifacts({ client, request })).toMatchObject(
    { status: 'skipped', reason: 'artifact import already in progress' },
  );
  expect(hydrate).not.toHaveBeenCalled();
  expect(sync).not.toHaveBeenCalled();
  expect(release).not.toHaveBeenCalled();
});

it('releases the lease after a retryable import failure', async () => {
  sync.mockRejectedValue(new Error('Recall unavailable'));
  await expect(
    importCallRecordingArtifacts({ client, request }),
  ).rejects.toThrow('Recall unavailable');
  expect(release).toHaveBeenCalledOnce();
});

it('never imports a provider recording unrelated to the verified upload', async () => {
  ownedUpload.mockResolvedValue({
    id: 'upload-1',
    recording_id: 'foreign',
    status: { code: 'complete' },
  });
  expect(await importCallRecordingArtifacts({ client, request })).toMatchObject(
    { status: 'skipped' },
  );
  expect(sync).not.toHaveBeenCalled();
  expect(hydrate).not.toHaveBeenCalled();
  expect(release).toHaveBeenCalledOnce();
});

it('rereads artifacts after claiming so a delayed worker does not reimport stale data', async () => {
  claim.mockImplementation(async () => {
    query.mockResolvedValue({
      callRecordings: {
        edges: [
          {
            node: {
              id: request.callRecordingId,
              status: 'COMPLETED',
              companionSession: { source: 'desktop', media: 'audio' },
              externalRecordingId: 'trusted-recall-id',
              audio: [{ fileId: 'already-saved' }],
            },
          },
        ],
      },
    });
    return true;
  });
  await importCallRecordingArtifacts({ client, request });
  expect(sync).toHaveBeenCalledWith(
    expect.objectContaining({
      callRecording: expect.objectContaining({
        audio: [{ fileId: 'already-saved' }],
      }),
    }),
  );
});
