import { describe, expect, it } from 'vitest';

import { type FathomMediaReconciliationCandidate } from 'src/logic-functions/types/fathom-media-reconciliation-plan.type';
import { buildDisconnectedFathomMediaReconciliationPlan } from 'src/logic-functions/utils/build-disconnected-fathom-media-reconciliation-plan.util';

const buildCallRecording = (
  overrides: Partial<FathomMediaReconciliationCandidate> = {},
): FathomMediaReconciliationCandidate => ({
  id: 'call-recording-id',
  fathomRecordingImportId: 'fathom-recording-import-id',
  fathomRecordingImportUpdatedAt: '2026-09-04T12:01:00.000Z',
  recordingId: '42',
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

const buildReference = (callRecordingId: string) => ({
  callRecordingId,
  callRecordingUpdatedAt: '2026-09-04T12:00:00.000Z',
  fathomRecordingImportId: 'fathom-recording-import-id',
  fathomRecordingImportUpdatedAt: '2026-09-04T12:01:00.000Z',
});

describe('buildDisconnectedFathomMediaReconciliationPlan', () => {
  it('settles missing media and completes imports only when a transcript exists', () => {
    const plan = buildDisconnectedFathomMediaReconciliationPlan([
      buildCallRecording({ id: 'ready-to-settle-and-complete' }),
      buildCallRecording({
        id: 'ready-to-settle',
        status: 'COMPLETED',
      }),
      buildCallRecording({
        id: 'ready-to-complete',
        hasVideo: true,
      }),
      buildCallRecording({
        id: 'processing-without-transcript',
        hasTranscript: false,
        hasAudio: true,
      }),
      buildCallRecording({
        id: 'missing-media-without-transcript',
        hasTranscript: false,
      }),
    ]);

    expect(plan).toEqual({
      callRecordingsToSettle: [buildReference('ready-to-settle')],
      callRecordingsToSettleAndComplete: [
        buildReference('ready-to-settle-and-complete'),
      ],
      callRecordingsToSettleAndFail: [
        buildReference('missing-media-without-transcript'),
      ],
      callRecordingsToComplete: [buildReference('ready-to-complete')],
      callRecordingsToFail: [buildReference('processing-without-transcript')],
    });
  });
});
