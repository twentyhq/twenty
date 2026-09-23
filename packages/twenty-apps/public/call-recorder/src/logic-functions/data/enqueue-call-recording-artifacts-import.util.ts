import { isNonEmptyArray, isUndefined } from '@sniptt/guards';
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
  delayMs,
}: {
  callRecordingIds: string[];
  scopes: CallRecordingArtifactImportScope[];
  trigger?: 'recording' | 'transcript-ready' | 'expired' | 'recovery';
  requestedAt?: string;
  delayMs?: number;
}): Promise<void> => {
  const isQueueStatusRequired = trigger === 'recovery' || trigger === 'expired';
  const recoveryDate = requestedAt.slice(0, 10);
  // An import started before midnight can still be running the next day.
  const previousRecoveryDate = new Date(
    new Date(requestedAt).getTime() - 24 * 60 * 60 * 1000,
  )
    .toISOString()
    .slice(0, 10);

  for (const scope of scopes) {
    const jobIdSuffixes = [
      '',
      '-expired',
      `-recovery-${recoveryDate}`,
      `-recovery-${previousRecoveryDate}`,
      ...(scope === 'transcript' ? ['-ready'] : []),
    ];

    for (const recordingIds of getBatches(
      callRecordingIds,
      Math.floor(
        MAX_PAYLOADS_PER_ENQUEUE_JOBS_CALL /
          (isQueueStatusRequired ? jobIdSuffixes.length : 1),
      ),
    )) {
      const baseJobs = recordingIds.map((callRecordingId) => ({
        jobId: `call-recorder-${callRecordingId}-${scope}`,
        payload: { callRecordingId, requestedAt, scope },
      }));
      const statuses = isQueueStatusRequired
        ? await getJobs(
            baseJobs.flatMap(({ jobId }) =>
              jobIdSuffixes.map((suffix) => `${jobId}${suffix}`),
            ),
          )
        : [];
      const statusesById = new Map(
        statuses.map((status) => [status.jobId, status]),
      );
      const jobs = baseJobs.flatMap(({ jobId, payload }) => {
        const initialJobStatus = statusesById.get(jobId);
        const transcriptReadyJobStatus = statusesById.get(`${jobId}-ready`);

        if (
          jobIdSuffixes.some((suffix) => {
            const status = statusesById.get(`${jobId}${suffix}`);

            return (
              !isUndefined(status) &&
              status.state !== 'COMPLETED' &&
              status.state !== 'FAILED'
            );
          })
        ) {
          return [];
        }

        // Queue history deduplicates completed and failed IDs, so repairs need a new ID.
        if (
          trigger === 'recovery' &&
          (!isUndefined(initialJobStatus) ||
            !isUndefined(transcriptReadyJobStatus))
        ) {
          return [{ jobId: `${jobId}-recovery-${recoveryDate}`, payload }];
        }

        if (trigger === 'transcript-ready') {
          return [{ jobId: `${jobId}-ready`, payload }];
        }

        if (trigger === 'expired') {
          return [{ jobId: `${jobId}-expired`, payload }];
        }

        return [{ jobId, payload }];
      });

      if (!isNonEmptyArray(jobs)) {
        continue;
      }

      await enqueueJobs({
        logicFunctionUniversalIdentifier:
          IMPORT_CALL_RECORDING_ARTIFACTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
        jobs,
        retryLimit: scope === 'video' ? 0 : ENQUEUED_JOB_RETRY_LIMIT,
        delayMs,
      });
    }
  }
};
