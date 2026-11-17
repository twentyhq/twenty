import { enqueueJobs } from 'twenty-sdk/logic-function';

import { GOOGLE_MEET_IMPORT_CONFERENCE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { GOOGLE_MEET_IMPORT_JOB_BATCH_SIZE } from 'src/logic-functions/constants/google-meet-import.constant';
import { type GoogleMeetConferenceRecord } from 'src/logic-functions/types/google-meet-conference-record.type';
import { buildGoogleMeetConferenceImportJob } from 'src/logic-functions/utils/build-google-meet-conference-import-job.util';
import { chunkIntoBatches } from 'src/logic-functions/utils/chunk-into-batches.util';

export const enqueueGoogleMeetConferenceImportsOrThrow = async ({
  connectedAccountId,
  conferenceRecords,
  now,
}: {
  connectedAccountId: string;
  conferenceRecords: Pick<
    GoogleMeetConferenceRecord,
    'name' | 'startTime' | 'endTime' | 'space'
  >[];
  now: Date;
}): Promise<void> => {
  const jobBatches = chunkIntoBatches({
    items: conferenceRecords.map((conferenceRecord) =>
      buildGoogleMeetConferenceImportJob({
        connectedAccountId,
        conferenceRecord,
        now,
      }),
    ),
    batchSize: GOOGLE_MEET_IMPORT_JOB_BATCH_SIZE,
  });

  for (const jobs of jobBatches) {
    await enqueueJobs({
      logicFunctionUniversalIdentifier:
        GOOGLE_MEET_IMPORT_CONFERENCE_UNIVERSAL_IDENTIFIER,
      jobs,
    });
  }
};
