import { describe, expect, it } from 'vitest';

import { mapCallRecordingMediaState } from 'src/logic-functions/utils/map-call-recording-media-state.util';

describe('mapCallRecordingMediaState', () => {
  it('maps persisted media state and a valid upload checkpoint', () => {
    expect(
      mapCallRecordingMediaState({
        id: 'call-recording-id',
        updatedAt: '2026-09-05T00:00:00.000Z',
        video: [{ fileId: 'video-file-id' }],
        audio: [{ fileId: null }],
        fathomRecordingImports: {
          edges: [
            {
              node: {
                id: 'fathom-recording-import-id',
                updatedAt: '2026-09-05T00:01:00.000Z',
                recordingId: 'recording-id',
                mediaFailureReason: 'failure-reason',
                connectedAccountId: 'connected-account-id',
                mediaDownloadId: 'download-id',
                mediaImportClaimedAt: '2026-09-05T00:00:30.000Z',
                mediaUploadCheckpoint: {
                  downloadId: 'download-id',
                  fileId: 'video-file-id',
                  kind: 'video',
                },
              },
            },
          ],
        },
        transcript: [{}],
        summary: { markdown: 'Summary', blocknote: null },
      }),
    ).toEqual({
      id: 'call-recording-id',
      updatedAt: '2026-09-05T00:00:00.000Z',
      fathomRecordingImportId: 'fathom-recording-import-id',
      fathomRecordingImportUpdatedAt: '2026-09-05T00:01:00.000Z',
      recordingId: 'recording-id',
      hasVideo: true,
      hasAudio: false,
      hasTranscript: true,
      hasSummary: true,
      failureReason: 'failure-reason',
      connectedAccountId: 'connected-account-id',
      downloadId: 'download-id',
      uploadCheckpoint: {
        downloadId: 'download-id',
        fileId: 'video-file-id',
        kind: 'video',
      },
    });
  });

  it('normalizes empty media fields and rejects a malformed checkpoint', () => {
    expect(
      mapCallRecordingMediaState({
        id: 'call-recording-id',
        updatedAt: '2026-09-05T00:00:00.000Z',
        video: [{ fileId: '' }, {}, { fileId: null }],
        audio: null,
        fathomRecordingImports: {
          edges: [
            {
              node: {
                id: '',
                updatedAt: '',
                recordingId: '',
                mediaFailureReason: '',
                connectedAccountId: null,
                mediaDownloadId: null,
                mediaUploadCheckpoint: {
                  downloadId: 'download-id',
                  fileId: '',
                  kind: 'video',
                },
              },
            },
          ],
        },
        transcript: {},
        summary: { markdown: '', blocknote: null },
      }),
    ).toEqual({
      id: 'call-recording-id',
      updatedAt: '2026-09-05T00:00:00.000Z',
      fathomRecordingImportId: undefined,
      fathomRecordingImportUpdatedAt: undefined,
      recordingId: undefined,
      hasVideo: false,
      hasAudio: false,
      hasTranscript: false,
      hasSummary: false,
      failureReason: undefined,
      connectedAccountId: undefined,
      downloadId: undefined,
      uploadCheckpoint: undefined,
    });
  });

  it('detects summary content stored as blocknote', () => {
    const mediaState = mapCallRecordingMediaState({
      id: 'call-recording-id',
      updatedAt: '2026-09-05T00:00:00.000Z',
      fathomRecordingImports: null,
      summary: { markdown: null, blocknote: {} },
    });

    expect(mediaState.hasSummary).toBe(true);
  });
});
