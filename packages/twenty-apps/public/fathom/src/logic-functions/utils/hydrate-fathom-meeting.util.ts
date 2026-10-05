import { type Fathom } from 'fathom-typescript';
import { type Meeting } from 'fathom-typescript/sdk/models/shared';

import { type SerializedFathomMeeting } from 'src/logic-functions/types/serialized-fathom-meeting.type';

export const hydrateFathomMeeting = async ({
  fathomClient,
  serializedMeeting,
}: {
  fathomClient: Pick<Fathom, 'getRecordingTranscript' | 'getRecordingSummary'>;
  serializedMeeting: SerializedFathomMeeting;
}): Promise<Meeting> => {
  const [transcriptResponse, summaryResponse] = await Promise.all([
    fathomClient.getRecordingTranscript({
      recordingId: serializedMeeting.recordingId,
    }),
    fathomClient.getRecordingSummary({
      recordingId: serializedMeeting.recordingId,
    }),
  ]);

  return {
    ...serializedMeeting,
    createdAt: new Date(serializedMeeting.createdAt),
    scheduledStartTime: new Date(serializedMeeting.scheduledStartTime),
    scheduledEndTime: new Date(serializedMeeting.scheduledEndTime),
    recordingStartTime: new Date(serializedMeeting.recordingStartTime),
    recordingEndTime: new Date(serializedMeeting.recordingEndTime),
    transcript:
      'transcript' in transcriptResponse
        ? transcriptResponse.transcript
        : undefined,
    defaultSummary:
      'summary' in summaryResponse ? summaryResponse.summary : undefined,
  };
};
