import { enqueueJobs } from 'twenty-sdk/logic-function';

import { MEET_IMPORT_CONFERENCE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { MEET_IMPORT_JOB_BATCH_SIZE } from 'src/logic-functions/constants/meet-import.constant';
import { type MeetConferenceRecord } from 'src/logic-functions/types/meet-conference-record.type';
import { buildMeetConferenceImportJob } from 'src/logic-functions/utils/build-meet-conference-import-job.util';
import { chunkIntoBatches } from 'src/logic-functions/utils/chunk-into-batches.util';

export const enqueueMeetConferenceImportsOrThrow = async ({
  connectedAccountId,
  conferenceRecords,
  now,
}: {
  connectedAccountId: string;
  conferenceRecords: Pick<
    MeetConferenceRecord,
    'name' | 'startTime' | 'endTime' | 'space'
  >[];
  now: Date;
}): Promise<void> => {
  const jobBatches = chunkIntoBatches({
    items: conferenceRecords.map((conferenceRecord) =>
      buildMeetConferenceImportJob({
        connectedAccountId,
        conferenceRecord,
        now,
      }),
    ),
    batchSize: MEET_IMPORT_JOB_BATCH_SIZE,
  });

  for (const jobs of jobBatches) {
    await enqueueJobs({
      logicFunctionUniversalIdentifier:
        MEET_IMPORT_CONFERENCE_UNIVERSAL_IDENTIFIER,
      jobs,
    });
  }
};
