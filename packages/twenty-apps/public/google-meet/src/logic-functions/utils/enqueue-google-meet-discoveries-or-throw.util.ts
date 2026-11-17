import { enqueueJobs } from 'twenty-sdk/logic-function';

import { GOOGLE_MEET_QUEUE_CONFERENCE_IMPORTS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { GOOGLE_MEET_IMPORT_JOB_BATCH_SIZE } from 'src/logic-functions/constants/google-meet-import.constant';
import { type GoogleMeetDiscoveryTrigger } from 'src/logic-functions/types/google-meet-discovery-trigger.type';
import { buildGoogleMeetDiscoveryJob } from 'src/logic-functions/utils/build-google-meet-discovery-job.util';
import { chunkIntoBatches } from 'src/logic-functions/utils/chunk-into-batches.util';

export const enqueueGoogleMeetDiscoveriesOrThrow = async ({
  connectedAccountIds,
  trigger,
  now,
}: {
  connectedAccountIds: string[];
  trigger: GoogleMeetDiscoveryTrigger;
  now: Date;
}): Promise<void> => {
  const jobBatches = chunkIntoBatches({
    items: connectedAccountIds.map((connectedAccountId) =>
      buildGoogleMeetDiscoveryJob({ connectedAccountId, trigger, now }),
    ),
    batchSize: GOOGLE_MEET_IMPORT_JOB_BATCH_SIZE,
  });

  for (const jobs of jobBatches) {
    await enqueueJobs({
      logicFunctionUniversalIdentifier:
        GOOGLE_MEET_QUEUE_CONFERENCE_IMPORTS_UNIVERSAL_IDENTIFIER,
      jobs,
    });
  }
};
