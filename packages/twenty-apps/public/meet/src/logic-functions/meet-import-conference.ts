import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { enqueueJobs, getConnection } from 'twenty-sdk/logic-function';

import {
  MEET_IMPORT_CONFERENCE_UNIVERSAL_IDENTIFIER,
  MEET_IMPORT_RECORDING_UNIVERSAL_IDENTIFIER,
  MEET_SUMMARIZE_CALL_RECORDING_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { type MeetConferenceSyncOutcome } from 'src/logic-functions/types/meet-conference-sync-outcome.type';
import { MEET_CALL_SUMMARY_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/meet-call-summary.constant';
import { MEET_RECORDING_IMPORT_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/meet-recording-import.constant';
import { buildMeetCallSummaryJob } from 'src/logic-functions/utils/build-meet-call-summary-job.util';
import { buildMeetRecordingImportJob } from 'src/logic-functions/utils/build-meet-recording-import-job.util';
import { getConnectionAccessTokenOrThrow } from 'src/logic-functions/utils/get-connection-access-token-or-throw.util';
import { syncMeetConferenceOrThrow } from 'src/logic-functions/utils/sync-meet-conference-or-throw.util';

type MeetImportConferenceResult =
  | { success: true; outcome: MeetConferenceSyncOutcome }
  | { success: false; error: string };

export const meetImportConferenceHandler = async ({
  connectedAccountId,
  conferenceRecordName,
  startTime,
  endTime,
  spaceName,
}: {
  connectedAccountId?: string;
  conferenceRecordName?: string;
  startTime?: string;
  endTime?: string;
  spaceName?: string;
}): Promise<MeetImportConferenceResult> => {
  if (
    !isNonEmptyString(connectedAccountId) ||
    !isNonEmptyString(conferenceRecordName) ||
    !isNonEmptyString(startTime)
  ) {
    return {
      success: false,
      error: 'Invalid Google Meet conference import job',
    };
  }

  const connection = await getConnection(connectedAccountId);

  const { outcome, shouldGenerateAiSummary, recordingNameToImport } =
    await syncMeetConferenceOrThrow({
      accessToken: getConnectionAccessTokenOrThrow(connection),
      coreApiClient: new CoreApiClient({ runAs: 'application' }),
      conferenceRecord: {
        name: conferenceRecordName,
        startTime,
        ...(isNonEmptyString(endTime) ? { endTime } : {}),
        ...(isNonEmptyString(spaceName) ? { space: spaceName } : {}),
      },
    });

  if (shouldGenerateAiSummary) {
    await enqueueJobs({
      logicFunctionUniversalIdentifier:
        MEET_SUMMARIZE_CALL_RECORDING_UNIVERSAL_IDENTIFIER,
      retryLimit: MEET_CALL_SUMMARY_JOB_RETRY_LIMIT,
      jobs: [
        buildMeetCallSummaryJob({
          conferenceRecordName,
          userWorkspaceId: connection.userWorkspaceId,
        }),
      ],
    });
  }

  if (isNonEmptyString(recordingNameToImport)) {
    await enqueueJobs({
      logicFunctionUniversalIdentifier:
        MEET_IMPORT_RECORDING_UNIVERSAL_IDENTIFIER,
      retryLimit: MEET_RECORDING_IMPORT_JOB_RETRY_LIMIT,
      jobs: [
        buildMeetRecordingImportJob({
          connectedAccountId,
          conferenceRecordName,
          recordingName: recordingNameToImport,
          now: new Date(),
        }),
      ],
    });
  }

  return { success: true, outcome };
};

export default defineLogicFunction({
  universalIdentifier: MEET_IMPORT_CONFERENCE_UNIVERSAL_IDENTIFIER,
  name: 'meet-import-conference',
  description:
    'Imports the transcript and Gemini notes of one Google Meet conference into a Call Recording, and queues the import of its video.',
  timeoutSeconds: 300,
  handler: meetImportConferenceHandler,
});
