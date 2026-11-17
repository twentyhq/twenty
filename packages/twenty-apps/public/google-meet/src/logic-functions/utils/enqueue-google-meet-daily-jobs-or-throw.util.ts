import { enqueueJobs } from 'twenty-sdk/logic-function';

import { GOOGLE_MEET_IMPORT_JOB_BATCH_SIZE } from 'src/logic-functions/constants/google-meet-import.constant';
import { type GoogleMeetDailyJobName } from 'src/logic-functions/types/google-meet-daily-job-name.type';
import { buildGoogleMeetDailyJob } from 'src/logic-functions/utils/build-google-meet-daily-job.util';
import { chunkIntoBatches } from 'src/logic-functions/utils/chunk-into-batches.util';

export const enqueueGoogleMeetDailyJobsOrThrow = async ({
  logicFunctionUniversalIdentifier,
  jobName,
  connectedAccountIds,
  now,
  delayMilliseconds,
}: {
  logicFunctionUniversalIdentifier: string;
  jobName: GoogleMeetDailyJobName;
  connectedAccountIds: string[];
  now: Date;
  delayMilliseconds: number;
}): Promise<void> => {
  const jobBatches = chunkIntoBatches({
    items: connectedAccountIds.map((connectedAccountId) =>
      buildGoogleMeetDailyJob({ jobName, connectedAccountId, now }),
    ),
    batchSize: GOOGLE_MEET_IMPORT_JOB_BATCH_SIZE,
  });

  for (const jobs of jobBatches) {
    await enqueueJobs({
      logicFunctionUniversalIdentifier,
      jobs,
      delayMs: delayMilliseconds,
    });
  }
};
