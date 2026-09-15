import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type SerializedFathomMeeting } from 'src/logic-functions/types/serialized-fathom-meeting.type';
import { computeCallRecordingIdForFathomMeeting } from 'src/logic-functions/utils/compute-call-recording-id-for-fathom-meeting.util';
import { listDeletedCallRecordingIds } from 'src/logic-functions/utils/list-deleted-call-recording-ids.util';

// A recording someone deleted stays deleted: its CallRecording id is derived
// from the Fathom recording, so importing it again would collide with the
// tombstone that still holds that id.
export const excludeDeletedFathomMeetings = async ({
  coreApiClient,
  meetings,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  meetings: SerializedFathomMeeting[];
}): Promise<SerializedFathomMeeting[]> => {
  const identifiedMeetings = meetings.map((meeting) => ({
    meeting,
    callRecordingId: computeCallRecordingIdForFathomMeeting(
      meeting.recordingId,
    ),
  }));
  const deletedCallRecordingIds = await listDeletedCallRecordingIds({
    coreApiClient,
    callRecordingIds: identifiedMeetings.map(
      ({ callRecordingId }) => callRecordingId,
    ),
  });

  return identifiedMeetings
    .filter(
      ({ callRecordingId }) => !deletedCallRecordingIds.has(callRecordingId),
    )
    .map(({ meeting }) => meeting);
};
