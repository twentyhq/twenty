import { beforeEach, expect, it, vi } from 'vitest';

import { getOwnedDesktopUpload } from 'src/logic-functions/recall-api/get-owned-desktop-upload.util';

const { request, workspaceId } = vi.hoisted(() => ({
  request: vi.fn(),
  workspaceId: vi.fn(),
}));
vi.mock('src/logic-functions/data/get-current-workspace-id.util', () => ({
  getCurrentWorkspaceId: workspaceId,
}));
vi.mock('src/logic-functions/recall-api/get-recall-api-config.util', () => ({
  getRecallApiConfig: () => ({ success: true, config: {} }),
}));
vi.mock('src/logic-functions/recall-api/recall-bot-api-request.util', () => ({
  recallBotApiRequest: request,
}));

const recording = {
  id: 'recording-1',
  companionSession: {
    source: 'desktop',
    media: 'audio',
    sdkUploadId: 'upload-1',
    userWorkspaceId: 'owner-1',
  },
};
const upload = {
  id: 'upload-1',
  recording_id: 'provider-recording-1',
  status: { code: 'complete' },
  metadata: {
    twentyWorkspaceId: 'workspace-1',
    twentyCallRecordingId: 'recording-1',
    twentyUserWorkspaceId: 'owner-1',
  },
};

beforeEach(() => {
  vi.resetAllMocks();
  workspaceId.mockReturnValue('workspace-1');
  request.mockResolvedValue({ ok: true, data: upload });
});

it('accepts only the upload bound by Recall to this workspace, record and owner', async () => {
  expect(await getOwnedDesktopUpload(recording)).toEqual(upload);
  expect(request).toHaveBeenCalledWith(
    expect.objectContaining({
      path: '/sdk_upload/upload-1/',
      method: 'GET',
    }),
  );
});

it.each([
  'twentyWorkspaceId',
  'twentyCallRecordingId',
  'twentyUserWorkspaceId',
])(
  'rejects a foreign %s even when the editable session points to its upload',
  async (key) => {
    request.mockResolvedValue({
      ok: true,
      data: {
        ...upload,
        metadata: { ...upload.metadata, [key]: 'foreign' },
      },
    });
    expect(await getOwnedDesktopUpload(recording)).toBeUndefined();
  },
);

it('rejects missing provider metadata and mismatched upload IDs', async () => {
  request.mockResolvedValueOnce({
    ok: true,
    data: { ...upload, metadata: null },
  });
  expect(await getOwnedDesktopUpload(recording)).toBeUndefined();
  request.mockResolvedValueOnce({
    ok: true,
    data: { ...upload, id: 'foreign' },
  });
  expect(await getOwnedDesktopUpload(recording)).toBeUndefined();
});

it('does not treat provider unavailability as a verified upload', async () => {
  request.mockResolvedValue({ ok: false });
  await expect(getOwnedDesktopUpload(recording)).rejects.toThrow(
    'Unable to verify',
  );
});

it('requires authenticated workspace context and an owning desktop session', async () => {
  expect(await getOwnedDesktopUpload({ id: recording.id })).toBeUndefined();
  expect(request).not.toHaveBeenCalled();
  workspaceId.mockReturnValue(undefined);
  await expect(getOwnedDesktopUpload(recording)).rejects.toThrow(
    'not configured',
  );
  expect(request).not.toHaveBeenCalled();
});

it('encodes an editable upload ID as one path segment', async () => {
  await getOwnedDesktopUpload({
    ...recording,
    companionSession: {
      ...recording.companionSession,
      sdkUploadId: '../other?token=x',
    },
  });
  expect(request).toHaveBeenCalledWith(
    expect.objectContaining({
      path: '/sdk_upload/..%2Fother%3Ftoken%3Dx/',
    }),
  );
});
