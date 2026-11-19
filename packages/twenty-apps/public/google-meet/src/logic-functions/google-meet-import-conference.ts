import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { enqueueJobs, getConnection } from 'twenty-sdk/logic-function';

import {
  GOOGLE_MEET_IMPORT_CONFERENCE_UNIVERSAL_IDENTIFIER,
  GOOGLE_MEET_IMPORT_RECORDING_UNIVERSAL_IDENTIFIER,
  GOOGLE_MEET_SUMMARIZE_CALL_RECORDING_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { type GoogleMeetConferenceSyncOutcome } from 'src/logic-functions/types/google-meet-conference-sync-outcome.type';
import { GOOGLE_MEET_CALL_SUMMARY_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/google-meet-call-summary.constant';
import { GOOGLE_MEET_RECORDING_IMPORT_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/google-meet-recording-import.constant';
import { buildGoogleMeetCallSummaryJob } from 'src/logic-functions/utils/build-google-meet-call-summary-job.util';
import { buildGoogleMeetRecordingImportJob } from 'src/logic-functions/utils/build-google-meet-recording-import-job.util';
import { getConnectionAccessTokenOrThrow } from 'src/logic-functions/utils/get-connection-access-token-or-throw.util';
import { syncGoogleMeetConferenceOrThrow } from 'src/logic-functions/utils/sync-google-meet-conference-or-throw.util';

type GoogleMeetImportConferenceResult =
  | { success: true; outcome: GoogleMeetConferenceSyncOutcome }
  | { success: false; error: string };

export const googleMeetImportConferenceHandler = async ({
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
}): Promise<GoogleMeetImportConferenceResult> => {
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
    await syncGoogleMeetConferenceOrThrow({
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
        GOOGLE_MEET_SUMMARIZE_CALL_RECORDING_UNIVERSAL_IDENTIFIER,
      retryLimit: GOOGLE_MEET_CALL_SUMMARY_JOB_RETRY_LIMIT,
      jobs: [
        buildGoogleMeetCallSummaryJob({
          conferenceRecordName,
          userWorkspaceId: connection.userWorkspaceId,
        }),
      ],
    });
  }

  if (isNonEmptyString(recordingNameToImport)) {
    await enqueueJobs({
      logicFunctionUniversalIdentifier:
        GOOGLE_MEET_IMPORT_RECORDING_UNIVERSAL_IDENTIFIER,
      retryLimit: GOOGLE_MEET_RECORDING_IMPORT_JOB_RETRY_LIMIT,
      jobs: [
        buildGoogleMeetRecordingImportJob({
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
  universalIdentifier: GOOGLE_MEET_IMPORT_CONFERENCE_UNIVERSAL_IDENTIFIER,
  name: 'google-meet-import-conference',
  description:
    'Imports the transcript and Gemini notes of one Google Meet conference into a Call Recording, and queues the import of its video.',
  timeoutSeconds: 300,
  handler: googleMeetImportConferenceHandler,
});
