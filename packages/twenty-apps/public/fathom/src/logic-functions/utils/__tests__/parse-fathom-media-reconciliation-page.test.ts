import { describe, expect, it } from 'vitest';

import { parseFathomMediaReconciliationPage } from 'src/logic-functions/utils/parse-fathom-media-reconciliation-page.util';

describe('parseFathomMediaReconciliationPage', () => {
  it.each([{}, { callRecordings: null }])(
    'returns an empty terminal page for an absent connection: %j',
    (queryResult) => {
      expect(parseFathomMediaReconciliationPage(queryResult)).toEqual({
        callRecordings: [],
        hasNextPage: false,
      });
    },
  );

  it.each([false, true])(
    'preserves the continuation flag %s and normalizes reconciliation state',
    (hasNextPage) => {
      expect(
        parseFathomMediaReconciliationPage({
          callRecordings: {
            pageInfo: { hasNextPage },
            edges: [
              {
                node: {
                  id: 'call-recording-id',
                  updatedAt: '2026-09-05T00:00:00.000Z',
                  status: 'PROCESSING',
                  fathomRecordingImports: {
                    edges: [
                      {
                        node: {
                          id: 'fathom-recording-import-id',
                          updatedAt: '2026-09-05T00:01:00.000Z',
                          recordingId: '42',
                          connectedAccountId: 'connected-account-id',
                          mediaDownloadId: 'download-id',
                          mediaFailureReason: '',
                          mediaUploadCheckpoint: {
                            downloadId: 'download-id',
                            fileId: 'audio-file-id',
                            kind: 'audio',
                          },
                        },
                      },
                    ],
                  },
                  video: [],
                  audio: [{ fileId: 'audio-file-id' }],
                  transcript: [],
                },
              },
            ],
          },
        }),
      ).toEqual({
        callRecordings: [
          {
            id: 'call-recording-id',
            updatedAt: '2026-09-05T00:00:00.000Z',
            status: 'PROCESSING',
            fathomRecordingImportId: 'fathom-recording-import-id',
            fathomRecordingImportUpdatedAt: '2026-09-05T00:01:00.000Z',
            recordingId: '42',
            connectedAccountId: 'connected-account-id',
            downloadId: 'download-id',
            failureReason: undefined,
            hasVideo: false,
            hasAudio: true,
            hasTranscript: false,
            hasSummary: false,
            uploadCheckpoint: {
              downloadId: 'download-id',
              fileId: 'audio-file-id',
              kind: 'audio',
            },
          },
        ],
        hasNextPage,
      });
    },
  );

  it('rejects malformed pages instead of treating them as completed runs', () => {
    expect(() =>
      parseFathomMediaReconciliationPage({
        callRecordings: { edges: [], pageInfo: {} },
      }),
    ).toThrow();
  });

  it('rejects a recording without its optimistic concurrency timestamp', () => {
    expect(() =>
      parseFathomMediaReconciliationPage({
        callRecordings: {
          pageInfo: { hasNextPage: false },
          edges: [{ node: { id: 'call-recording-id', status: 'PROCESSING' } }],
        },
      }),
    ).toThrow();
  });
});
