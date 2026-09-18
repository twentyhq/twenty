import { enqueueJobs, getJobs } from 'twenty-sdk/logic-function';

import { IMPORT_CALL_RECORDING_ARTIFACTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { ENQUEUED_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/enqueued-job-retry-limit';
import { MAX_PAYLOADS_PER_ENQUEUE_JOBS_CALL } from 'src/logic-functions/constants/max-payloads-per-enqueue-jobs-call';
import { type CallRecordingArtifactImportScope } from 'src/logic-functions/types/call-recording-artifact-scope.type';
import { getBatches } from 'src/logic-functions/utils/get-batches.util';

export const enqueueCallRecordingArtifactsImport = async ({
  callRecordingIds,
  scopes,
  trigger = 'recording',
  requestedAt = new Date().toISOString(),
}: {
  callRecordingIds: string[];
  scopes: CallRecordingArtifactImportScope[];
  trigger?: 'recording' | 'transcript-ready' | 'expired' | 'recovery';
  requestedAt?: string;
}): Promise<void> => {
  for (const scope of scopes) {
    for (const recordingIds of getBatches(
      callRecordingIds,
      MAX_PAYLOADS_PER_ENQUEUE_JOBS_CALL / 2,
    )) {
      const baseJobs = recordingIds.map((callRecordingId) => ({
        jobId: `call-recorder-${callRecordingId}-${scope}`,
        payload: { callRecordingId, requestedAt, scope },
      }));
      const needsQueueStatus = trigger === 'recovery' || trigger === 'expired';
      const statuses = needsQueueStatus
        ? await getJobs(
            baseJobs.flatMap(({ jobId }) =>
              scope === 'transcript' ? [jobId, `${jobId}-ready`] : [jobId],
            ),
          )
        : [];
      const statusesById = new Map(
        statuses.map((status) => [status.jobId, status]),
      );
      const jobs = baseJobs.flatMap(({ jobId, payload }) => {
        const existing = statusesById.get(jobId);
        const ready = statusesById.get(`${jobId}-ready`);

        if (
          [existing, ready].some(
            (status) =>
              status &&
              status.state !== 'COMPLETED' &&
              status.state !== 'FAILED',
          )
        ) {
          return [];
        }

        // Queue history also deduplicates completed/failed ids. A repair is a
        // new attempt, while repeated dispatches within that repair share an id.
        const suffix =
          trigger === 'recovery' && (existing || ready)
            ? `-recovery-${requestedAt.slice(0, 10)}`
            : trigger === 'transcript-ready'
              ? '-ready'
              : trigger === 'expired'
                ? '-expired'
                : '';

        return [{ jobId: `${jobId}${suffix}`, payload }];
      });

      if (jobs.length === 0) continue;

      await enqueueJobs({
        logicFunctionUniversalIdentifier:
          IMPORT_CALL_RECORDING_ARTIFACTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
        jobs,
        retryLimit: scope === 'video' ? 0 : ENQUEUED_JOB_RETRY_LIMIT,
      });
    }
  }
};
