import { isDefined } from 'twenty-sdk/utils';

import { type DeletedAndCompletedCallRecordingIds } from 'src/features/transcripts/logic-functions/types/deleted-and-completed-call-recording-ids.type';
import { type ExistingCallRecording } from 'src/features/transcripts/logic-functions/types/existing-call-recording.type';

const isCreatedSince = ({
  callRecording,
  importedSince,
}: {
  callRecording: ExistingCallRecording;
  importedSince?: string;
}): boolean =>
  isDefined(importedSince) &&
  Date.parse(callRecording.createdAt) >= Date.parse(importedSince);

export const getDeletedAndCompletedCallRecordingIds = ({
  callRecordings,
  importedSince,
}: {
  callRecordings: ExistingCallRecording[];
  importedSince?: string;
}): DeletedAndCompletedCallRecordingIds => {
  const completedCallRecordings = callRecordings.filter(
    (callRecording) =>
      !isDefined(callRecording.deletedAt) &&
      callRecording.status === 'COMPLETED',
  );

  return {
    deletedCallRecordingIds: new Set(
      callRecordings
        .filter((callRecording) => isDefined(callRecording.deletedAt))
        .map((callRecording) => callRecording.id),
    ),
    completedCallRecordingIds: new Set(
      completedCallRecordings
        .filter(
          (callRecording) => !isCreatedSince({ callRecording, importedSince }),
        )
        .map((callRecording) => callRecording.id),
    ),
    importedCallRecordingIds: new Set(
      completedCallRecordings
        .filter((callRecording) =>
          isCreatedSince({ callRecording, importedSince }),
        )
        .map((callRecording) => callRecording.id),
    ),
  };
};
