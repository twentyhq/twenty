import { describe, expect, it } from 'vitest';

import { buildFathomMediaReconciliationPlan } from 'src/logic-functions/utils/build-fathom-media-reconciliation-plan.util';
import { type FathomMediaReconciliationCandidate } from 'src/logic-functions/types/fathom-media-reconciliation-plan.type';

const buildCallRecording = (
  overrides: Partial<FathomMediaReconciliationCandidate> = {},
): FathomMediaReconciliationCandidate => ({
  id: 'call-recording-id',
  externalRecordingId: '42',
  hasVideo: false,
  hasAudio: false,
  hasTranscript: true,
  hasSummary: true,
  failureReason: undefined,
  connectedAccountId: 'connected-account-id',
  downloadId: undefined,
  uploadCheckpoint: undefined,
  status: 'PROCESSING',
  updatedAt: '2026-09-04T12:00:00.000Z',
  ...overrides,
});

describe('buildFathomMediaReconciliationPlan', () => {
  it('completes settled recordings and groups missing imports by account', () => {
    const plan = buildFathomMediaReconciliationPlan({
      callRecordings: [
        buildCallRecording({ id: 'video-ready', hasVideo: true }),
        buildCallRecording({
          id: 'failure-settled',
          failureReason: 'download_forbidden',
        }),
        buildCallRecording({ id: 'missing-media-1' }),
        buildCallRecording({ id: 'missing-media-2' }),
        buildCallRecording({
          id: 'download-ready-to-poll',
          downloadId: 'download-id',
        }),
        buildCallRecording({
          id: 'another-account',
          connectedAccountId: 'another-connected-account-id',
        }),
      ],
      activeConnectedAccountIds: [
        'connected-account-id',
        'another-connected-account-id',
      ],
    });

    expect(plan).toEqual({
      callRecordingsToComplete: [
        {
          id: 'video-ready',
          updatedAt: '2026-09-04T12:00:00.000Z',
        },
        {
          id: 'failure-settled',
          updatedAt: '2026-09-04T12:00:00.000Z',
        },
      ],
      importGroups: [
        {
          connectedAccountId: 'connected-account-id',
          callRecordingIdsToRequest: ['missing-media-1', 'missing-media-2'],
          downloadsToPoll: [
            {
              callRecordingId: 'download-ready-to-poll',
              downloadId: 'download-id',
            },
          ],
        },
        {
          connectedAccountId: 'another-connected-account-id',
          callRecordingIdsToRequest: ['another-account'],
          downloadsToPoll: [],
        },
      ],
      disconnectedAccountIds: [],
    });
  });

  it('does not retry settled media while its transcript is still absent', () => {
    const plan = buildFathomMediaReconciliationPlan({
      callRecordings: [
        buildCallRecording({ hasTranscript: false, hasAudio: true }),
      ],
      activeConnectedAccountIds: ['connected-account-id'],
    });

    expect(plan).toEqual({
      callRecordingsToComplete: [],
      importGroups: [],
      disconnectedAccountIds: [],
    });
  });

  it('repairs missing media on a legacy completed recording', () => {
    const plan = buildFathomMediaReconciliationPlan({
      callRecordings: [
        buildCallRecording({ status: 'COMPLETED', hasTranscript: false }),
      ],
      activeConnectedAccountIds: ['connected-account-id'],
    });

    expect(plan.importGroups).toEqual([
      {
        connectedAccountId: 'connected-account-id',
        callRecordingIdsToRequest: ['call-recording-id'],
        downloadsToPoll: [],
      },
    ]);
  });

  it('routes unfinished imports for disconnected accounts to cleanup', () => {
    const plan = buildFathomMediaReconciliationPlan({
      callRecordings: [
        buildCallRecording(),
        buildCallRecording({ id: 'settled-recording', hasVideo: true }),
      ],
      activeConnectedAccountIds: [],
    });

    expect(plan).toEqual({
      callRecordingsToComplete: [],
      importGroups: [],
      disconnectedAccountIds: ['connected-account-id'],
    });
  });
});
