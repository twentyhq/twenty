import { type CoreApiClient } from 'twenty-client-sdk/core';
import { type AppConnection } from 'twenty-sdk/logic-function';

import { type SerializedFathomMeeting } from 'src/logic-functions/types/serialized-fathom-meeting.type';
import { computeCallRecordingIdForFathomMeeting } from 'src/logic-functions/utils/compute-call-recording-id-for-fathom-meeting.util';
import { listCallRecordingIdsImportedByOtherConnections } from 'src/logic-functions/utils/list-call-recording-ids-imported-by-other-connections.util';

export const excludeFathomMeetingsImportedByOtherConnections = async ({
  coreApiClient,
  meetings,
  connectedAccountId,
  connectionScope,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  meetings: SerializedFathomMeeting[];
  connectedAccountId: string;
  connectionScope: AppConnection['scope'];
}): Promise<SerializedFathomMeeting[]> => {
  if (connectionScope !== 'USER') {
    return meetings;
  }

  const identifiedMeetings = meetings.map((meeting) => ({
    meeting,
    callRecordingId: computeCallRecordingIdForFathomMeeting(
      meeting.recordingId,
    ),
  }));
  const importedCallRecordingIds =
    await listCallRecordingIdsImportedByOtherConnections({
      coreApiClient,
      callRecordingIds: identifiedMeetings.map(
        ({ callRecordingId }) => callRecordingId,
      ),
      connectedAccountId,
    });

  return identifiedMeetings
    .filter(
      ({ callRecordingId }) => !importedCallRecordingIds.has(callRecordingId),
    )
    .map(({ meeting }) => meeting);
};
