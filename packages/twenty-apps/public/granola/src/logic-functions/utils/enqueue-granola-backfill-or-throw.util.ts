import { isDefined } from 'twenty-sdk/utils';

import { GRANOLA_HISTORY_IMPORT_INTERVAL_MILLISECONDS } from 'src/constants/granola-history.constant';
import { GRANOLA_BACKFILL_WORKER_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type GranolaBackfillWorkerPayload } from 'src/logic-functions/types/granola-backfill-worker-payload.type';
import { enqueueGranolaJobOrThrow } from 'src/logic-functions/utils/enqueue-granola-job-or-throw.util';
import { findGranolaRegistrationForCurrentKey } from 'src/logic-functions/utils/find-granola-registration-for-current-key.util';
import { getGranolaJobId } from 'src/logic-functions/utils/get-granola-job-id.util';

export const enqueueGranolaBackfillOrThrow = async ({
  createdAfter,
  updatedAfter,
  folderIds,
}: {
  createdAfter?: string;
  updatedAfter?: string;
  folderIds?: string[];
}) => {
  const registration = await findGranolaRegistrationForCurrentKey();

  if (!isDefined(registration)) {
    throw new Error('Set up live sync before importing notes.');
  }

  const selectedFolders = folderIds ?? registration.folderIds;
  const discoveryFolders =
    selectedFolders.length > 0 ? [...new Set(selectedFolders)] : [undefined];

  for (const [index, folderId] of discoveryFolders.entries()) {
    const payload: GranolaBackfillWorkerPayload = {
      registrationId: registration.registrationId,
      createdAfter,
      updatedAfter,
      folderId,
      pageIndex: 0,
    };

    await enqueueGranolaJobOrThrow({
      logicFunctionUniversalIdentifier:
        GRANOLA_BACKFILL_WORKER_UNIVERSAL_IDENTIFIER,
      payload,
      jobId: getGranolaJobId({
        prefix: 'granola-discovery',
        identity: payload,
      }),
      delayMs: index * GRANOLA_HISTORY_IMPORT_INTERVAL_MILLISECONDS,
    });
  }

  return { enqueuedDiscoveryCount: discoveryFolders.length };
};
