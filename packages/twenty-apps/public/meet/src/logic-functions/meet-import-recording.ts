import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { getConnection } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { MEET_IMPORT_RECORDING_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { MEET_RECORDING_MAX_FILE_SIZE_BYTES } from 'src/logic-functions/constants/meet-recording-import.constant';
import { type MeetRecordingImportOutcome } from 'src/logic-functions/types/meet-recording-import-outcome.type';
import { computeCallRecordingIdForMeetConference } from 'src/logic-functions/utils/compute-call-recording-id-for-meet-conference.util';
import { findCallRecordingVideoState } from 'src/logic-functions/utils/find-call-recording-video-state.util';
import { getConnectionAccessTokenOrThrow } from 'src/logic-functions/utils/get-connection-access-token-or-throw.util';
import { getGoogleDriveFileSizeBytesOrThrow } from 'src/logic-functions/utils/get-google-drive-file-size-bytes-or-throw.util';
import { getMeetRecording } from 'src/logic-functions/utils/get-meet-recording.util';
import { getMeetRecordingDriveFileId } from 'src/logic-functions/utils/get-meet-recording-drive-file-id.util';
import { saveCallRecordingVideo } from 'src/logic-functions/utils/save-call-recording-video.util';
import { uploadGoogleDriveFileAsCallRecordingVideoOrThrow } from 'src/logic-functions/utils/upload-google-drive-file-as-call-recording-video-or-throw.util';

type MeetImportRecordingResult =
  | { success: true; outcome: MeetRecordingImportOutcome }
  | { success: false; error: string };

export const meetImportRecordingHandler = async ({
  connectedAccountId,
  conferenceRecordName,
  recordingName,
}: {
  connectedAccountId?: string;
  conferenceRecordName?: string;
  recordingName?: string;
}): Promise<MeetImportRecordingResult> => {
  if (
    !isNonEmptyString(connectedAccountId) ||
    !isNonEmptyString(conferenceRecordName) ||
    !isNonEmptyString(recordingName)
  ) {
    return {
      success: false,
      error: 'Invalid Google Meet recording import job',
    };
  }

  const coreApiClient = new CoreApiClient({ runAs: 'application' });
  const callRecordingId =
    computeCallRecordingIdForMeetConference(conferenceRecordName);
  const videoState = await findCallRecordingVideoState({
    coreApiClient,
    callRecordingId,
  });

  if (!isDefined(videoState)) {
    return { success: true, outcome: 'NOT_FOUND' };
  }

  if (videoState.hasVideo) {
    return { success: true, outcome: 'ALREADY_IMPORTED' };
  }

  const accessToken = getConnectionAccessTokenOrThrow(
    await getConnection(connectedAccountId),
  );
  const driveFileId = getMeetRecordingDriveFileId(
    await getMeetRecording({ accessToken, recordingName }),
  );

  if (!isNonEmptyString(driveFileId)) {
    return { success: true, outcome: 'RECORDING_NOT_READY' };
  }

  const sizeBytes = await getGoogleDriveFileSizeBytesOrThrow({
    accessToken,
    driveFileId,
  });

  if (sizeBytes > MEET_RECORDING_MAX_FILE_SIZE_BYTES) {
    return { success: true, outcome: 'TOO_LARGE' };
  }

  await saveCallRecordingVideo({
    coreApiClient,
    callRecordingId,
    fileId: await uploadGoogleDriveFileAsCallRecordingVideoOrThrow({
      accessToken,
      driveFileId,
      sizeBytes,
    }),
  });

  return { success: true, outcome: 'IMPORTED' };
};

export default defineLogicFunction({
  universalIdentifier: MEET_IMPORT_RECORDING_UNIVERSAL_IDENTIFIER,
  name: 'meet-import-recording',
  description:
    'Imports the video of one Google Meet recording from Google Drive into its Call Recording.',
  timeoutSeconds: 900,
  handler: meetImportRecordingHandler,
});
