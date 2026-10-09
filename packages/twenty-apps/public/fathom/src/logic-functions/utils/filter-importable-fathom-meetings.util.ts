import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type SerializedFathomMeeting } from 'src/logic-functions/types/serialized-fathom-meeting.type';
import { computeCallRecordingIdForFathomMeeting } from 'src/logic-functions/utils/compute-call-recording-id-for-fathom-meeting.util';
import { findDeletedOrCompletedCallRecordings } from 'src/logic-functions/utils/find-deleted-or-completed-call-recordings.util';
import { isFathomCallRecordingUpToDate } from 'src/logic-functions/utils/is-fathom-call-recording-up-to-date.util';
import { isDefined } from 'src/utils/is-defined';

// A recording someone deleted stays deleted: its CallRecording id is derived
// from the Fathom recording, so importing it again would collide with the
// tombstone that still holds that id.
export const filterImportableFathomMeetings = async ({
  coreApiClient,
  meetings,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  meetings: SerializedFathomMeeting[];
}): Promise<{
  importableMeetings: SerializedFathomMeeting[];
  deletedMeetingCount: number;
  upToDateMeetingCount: number;
}> => {
  const identifiedMeetings = meetings.map((meeting) => ({
    meeting,
    callRecordingId: computeCallRecordingIdForFathomMeeting(
      meeting.recordingId,
    ),
  }));
  const callRecordings = await findDeletedOrCompletedCallRecordings({
    coreApiClient,
    callRecordingIds: identifiedMeetings.map(
      ({ callRecordingId }) => callRecordingId,
    ),
  });
  const importableMeetings: SerializedFathomMeeting[] = [];
  let deletedMeetingCount = 0;
  let upToDateMeetingCount = 0;

  for (const { meeting, callRecordingId } of identifiedMeetings) {
    const callRecording = callRecordings.get(callRecordingId);

    if (callRecording?.isDeleted === true) {
      deletedMeetingCount += 1;
      continue;
    }

    if (
      isDefined(callRecording) &&
      isFathomCallRecordingUpToDate({ meeting, callRecording })
    ) {
      upToDateMeetingCount += 1;
      continue;
    }

    importableMeetings.push(meeting);
  }

  return { importableMeetings, deletedMeetingCount, upToDateMeetingCount };
};
