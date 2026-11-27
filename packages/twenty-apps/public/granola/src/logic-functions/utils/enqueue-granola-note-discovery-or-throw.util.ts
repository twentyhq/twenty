import { GRANOLA_HISTORY_IMPORT_INTERVAL_MILLISECONDS } from 'src/constants/granola-history.constant';
import { GRANOLA_BACKFILL_WORKER_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type GranolaBackfillWorkerPayload } from 'src/logic-functions/types/granola-backfill-worker-payload.type';
import { enqueueGranolaJobsOrThrow } from 'src/logic-functions/utils/enqueue-granola-jobs-or-throw.util';
import { getGranolaJobId } from 'src/logic-functions/utils/get-granola-job-id.util';

export const enqueueGranolaNoteDiscoveryOrThrow = async ({
  registrationId,
  createdAfter,
  updatedAfter,
  discoveryFolderIds,
}: {
  registrationId: string;
  createdAfter?: string;
  updatedAfter?: string;
  discoveryFolderIds: readonly (string | undefined)[];
}) => {
  const discoveryFolders = [...new Set(discoveryFolderIds)];

  for (const [index, folderId] of discoveryFolders.entries()) {
    const payload: GranolaBackfillWorkerPayload = {
      registrationId,
      createdAfter,
      updatedAfter,
      folderId,
      pageIndex: 0,
    };

    await enqueueGranolaJobsOrThrow({
      logicFunctionUniversalIdentifier:
        GRANOLA_BACKFILL_WORKER_UNIVERSAL_IDENTIFIER,
      jobs: [
        {
          payload,
          jobId: getGranolaJobId({
            prefix: 'granola-discovery',
            identity: payload,
          }),
        },
      ],
      delayMs: index * GRANOLA_HISTORY_IMPORT_INTERVAL_MILLISECONDS,
    });
  }

  return { enqueuedDiscoveryCount: discoveryFolders.length };
};
