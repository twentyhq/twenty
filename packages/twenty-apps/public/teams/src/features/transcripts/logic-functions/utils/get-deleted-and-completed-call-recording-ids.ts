import { isDefined } from 'twenty-sdk/utils';

import { type DeletedAndCompletedCallRecordingIds } from 'src/features/transcripts/logic-functions/types/deleted-and-completed-call-recording-ids.type';
import { type ExistingCallRecording } from 'src/features/transcripts/logic-functions/types/existing-call-recording.type';

export const getDeletedAndCompletedCallRecordingIds = (
  callRecordings: ExistingCallRecording[],
): DeletedAndCompletedCallRecordingIds => ({
  deletedCallRecordingIds: new Set(
    callRecordings
      .filter((callRecording) => isDefined(callRecording.deletedAt))
      .map((callRecording) => callRecording.id),
  ),
  completedCallRecordingIds: new Set(
    callRecordings
      .filter(
        (callRecording) =>
          !isDefined(callRecording.deletedAt) &&
          callRecording.status === 'COMPLETED',
      )
      .map((callRecording) => callRecording.id),
  ),
});
