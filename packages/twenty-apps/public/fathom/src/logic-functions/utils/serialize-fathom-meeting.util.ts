import { type Meeting } from 'fathom-typescript/sdk/models/shared';

import { type SerializedFathomMeeting } from 'src/logic-functions/types/serialized-fathom-meeting.type';

export const serializeFathomMeeting = ({
  transcript: _transcript,
  defaultSummary: _defaultSummary,
  ...meeting
}: Meeting): SerializedFathomMeeting => ({
  ...meeting,
  createdAt: meeting.createdAt.toISOString(),
  scheduledStartTime: meeting.scheduledStartTime.toISOString(),
  scheduledEndTime: meeting.scheduledEndTime.toISOString(),
  recordingStartTime: meeting.recordingStartTime.toISOString(),
  recordingEndTime: meeting.recordingEndTime.toISOString(),
});
