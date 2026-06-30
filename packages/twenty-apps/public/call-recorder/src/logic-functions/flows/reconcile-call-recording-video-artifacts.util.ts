import { isNonEmptyArray, isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { deferCallRecordingArtifactReconciliation } from 'src/logic-functions/data/defer-call-recording-artifact-reconciliation.util';
import { fetchCallRecordingArtifactCandidates } from 'src/logic-functions/data/fetch-call-recording-artifact-candidates.util';
import { ingestCallRecordingVideo } from 'src/logic-functions/flows/ingest-call-recording-media.util';
import { persistCallRecordingProgress } from 'src/logic-functions/flows/persist-call-recording-progress.util';

const VIDEO_ARTIFACT_RECONCILIATION_BATCH_SIZE = 5;

export type ReconcileCallRecordingVideoArtifactsResult = {
  candidateCount: number;
  updatedCallRecordingCount: number;
  skippedAlreadyPresentCount: number;
  skippedMissingRecordingIdCount: number;
  skippedMissingUrlCount: number;
  skippedSizeUnavailableCount: number;
  skippedTooLargeCount: number;
  failedCount: number;
  deferredCallRecordingCount: number;
};

export const reconcileCallRecordingVideoArtifacts = async ({
  client,
  now,
}: {
  client: CoreApiClient;
  now: Date;
}): Promise<ReconcileCallRecordingVideoArtifactsResult> => {
  const candidates = await fetchCallRecordingArtifactCandidates({
    client,
    first: VIDEO_ARTIFACT_RECONCILIATION_BATCH_SIZE,
    artifactKind: 'video',
    now,
  });
  const result: ReconcileCallRecordingVideoArtifactsResult = {
    candidateCount: candidates.length,
    updatedCallRecordingCount: 0,
    skippedAlreadyPresentCount: 0,
    skippedMissingRecordingIdCount: 0,
    skippedMissingUrlCount: 0,
    skippedSizeUnavailableCount: 0,
    skippedTooLargeCount: 0,
    failedCount: 0,
    deferredCallRecordingCount: 0,
  };

  for (const candidate of candidates) {
    const deferCandidate = async (): Promise<void> => {
      await deferCallRecordingArtifactReconciliation(client, {
        id: candidate.id,
      });
      result.deferredCallRecordingCount += 1;
    };

    if (isNonEmptyArray(candidate.video)) {
      result.skippedAlreadyPresentCount += 1;
      continue;
    }

    if (isUndefined(candidate.externalRecordingId)) {
      result.skippedMissingRecordingIdCount += 1;
      await deferCandidate();
      continue;
    }

    const videoResult = await ingestCallRecordingVideo({
      callRecordingId: candidate.id,
      externalRecordingId: candidate.externalRecordingId,
      hasVideo: false,
    });

    switch (videoResult.outcome) {
      case 'uploaded':
        await persistCallRecordingProgress(client, {
          id: candidate.id,
          current: candidate,
          updateData: videoResult.updateData,
        });
        result.updatedCallRecordingCount += 1;
        break;
      case 'already-present':
        result.skippedAlreadyPresentCount += 1;
        break;
      case 'missing-url':
        result.skippedMissingUrlCount += 1;
        await deferCandidate();
        break;
      case 'size-unavailable':
        result.skippedSizeUnavailableCount += 1;
        await deferCandidate();
        break;
      case 'too-large':
        result.skippedTooLargeCount += 1;
        await deferCandidate();
        break;
      case 'failed':
      case 'recording-fetch-failed':
        result.failedCount += 1;
        await deferCandidate();
        break;
    }
  }

  return result;
};
