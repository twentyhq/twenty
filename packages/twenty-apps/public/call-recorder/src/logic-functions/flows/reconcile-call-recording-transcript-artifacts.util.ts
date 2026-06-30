import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { deferCallRecordingArtifactReconciliation } from 'src/logic-functions/data/defer-call-recording-artifact-reconciliation.util';
import { fetchCallRecordingArtifactCandidates } from 'src/logic-functions/data/fetch-call-recording-artifact-candidates.util';
import { parseTranscriptMarker } from 'src/logic-functions/domain/parse-transcript-marker.util';
import { persistCallRecordingProgress } from 'src/logic-functions/flows/persist-call-recording-progress.util';
import { reconcileCallRecordingTranscriptArtifact } from 'src/logic-functions/flows/reconcile-call-recording-transcript-artifact.util';

const TRANSCRIPT_ARTIFACT_RECONCILIATION_BATCH_SIZE = 25;

export type ReconcileCallRecordingTranscriptArtifactsResult = {
  candidateCount: number;
  updatedCallRecordingCount: number;
  requestedTranscriptCount: number;
  skippedAlreadyFilledCount: number;
  skippedMissingRecordingIdCount: number;
  deferredCallRecordingCount: number;
};

export const reconcileCallRecordingTranscriptArtifacts = async ({
  client,
  now,
}: {
  client: CoreApiClient;
  now: Date;
}): Promise<ReconcileCallRecordingTranscriptArtifactsResult> => {
  const candidates = await fetchCallRecordingArtifactCandidates({
    client,
    first: TRANSCRIPT_ARTIFACT_RECONCILIATION_BATCH_SIZE,
    artifactKind: 'transcript',
    now,
  });
  const result: ReconcileCallRecordingTranscriptArtifactsResult = {
    candidateCount: candidates.length,
    updatedCallRecordingCount: 0,
    requestedTranscriptCount: 0,
    skippedAlreadyFilledCount: 0,
    skippedMissingRecordingIdCount: 0,
    deferredCallRecordingCount: 0,
  };

  for (const candidate of candidates) {
    const deferCandidate = async (): Promise<void> => {
      await deferCallRecordingArtifactReconciliation(client, {
        id: candidate.id,
      });
      result.deferredCallRecordingCount += 1;
    };
    const existingTranscriptMarker = parseTranscriptMarker(
      candidate.transcript,
    );

    if (
      !isUndefined(candidate.transcript) &&
      isUndefined(existingTranscriptMarker)
    ) {
      result.skippedAlreadyFilledCount += 1;
      await deferCandidate();
      continue;
    }

    if (isUndefined(candidate.externalRecordingId)) {
      result.skippedMissingRecordingIdCount += 1;
      await deferCandidate();
      continue;
    }

    const transcriptResult = await reconcileCallRecordingTranscriptArtifact({
      callRecordingId: candidate.id,
      currentStatus: candidate.status,
      externalRecordingId: candidate.externalRecordingId,
      requestedAt: now.toISOString(),
      transcript: candidate.transcript,
    });

    if (transcriptResult.requestedTranscript) {
      result.requestedTranscriptCount += 1;
    }

    if (Object.keys(transcriptResult.updateData).length === 0) {
      await deferCandidate();
      continue;
    }

    await persistCallRecordingProgress(client, {
      id: candidate.id,
      current: candidate,
      updateData: transcriptResult.updateData,
    });
    result.updatedCallRecordingCount += 1;
  }

  return result;
};
