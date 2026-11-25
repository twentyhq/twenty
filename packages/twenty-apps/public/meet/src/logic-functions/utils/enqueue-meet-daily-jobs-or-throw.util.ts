import { enqueueJobs } from 'twenty-sdk/logic-function';

import { MEET_IMPORT_JOB_BATCH_SIZE } from 'src/logic-functions/constants/meet-import.constant';
import { type MeetDailyJobName } from 'src/logic-functions/types/meet-daily-job-name.type';
import { buildMeetDailyJob } from 'src/logic-functions/utils/build-meet-daily-job.util';
import { chunkIntoBatches } from 'src/logic-functions/utils/chunk-into-batches.util';

export const enqueueMeetDailyJobsOrThrow = async ({
  logicFunctionUniversalIdentifier,
  jobName,
  connectedAccountIds,
  now,
  delayMilliseconds,
}: {
  logicFunctionUniversalIdentifier: string;
  jobName: MeetDailyJobName;
  connectedAccountIds: string[];
  now: Date;
  delayMilliseconds: number;
}): Promise<void> => {
  const jobBatches = chunkIntoBatches({
    items: connectedAccountIds.map((connectedAccountId) =>
      buildMeetDailyJob({ jobName, connectedAccountId, now }),
    ),
    batchSize: MEET_IMPORT_JOB_BATCH_SIZE,
  });

  for (const jobs of jobBatches) {
    await enqueueJobs({
      logicFunctionUniversalIdentifier,
      jobs,
      delayMs: delayMilliseconds,
    });
  }
};
