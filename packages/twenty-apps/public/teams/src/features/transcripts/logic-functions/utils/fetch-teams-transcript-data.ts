import { type GraphCallTranscript } from 'src/features/transcripts/logic-functions/types/graph-call-transcript.type';
import { type GraphOnlineMeeting } from 'src/features/transcripts/logic-functions/types/graph-online-meeting.type';
import { downloadMeetingTranscriptContent } from 'src/features/transcripts/logic-functions/utils/download-meeting-transcript-content';
import { getMeetingById } from 'src/features/transcripts/logic-functions/utils/get-meeting-by-id';
import { getMeetingTranscript } from 'src/features/transcripts/logic-functions/utils/get-meeting-transcript';

export const fetchTeamsTranscriptData = async ({
  accessToken,
  meetingId,
  transcriptId,
}: {
  accessToken: string;
  meetingId: string;
  transcriptId: string;
}): Promise<{
  meeting: GraphOnlineMeeting;
  transcript: GraphCallTranscript;
  transcriptContent: string;
}> => {
  const [meeting, transcript, transcriptContent] = await Promise.all([
    getMeetingById({ accessToken, meetingId }),
    getMeetingTranscript({ accessToken, meetingId, transcriptId }),
    downloadMeetingTranscriptContent({ accessToken, meetingId, transcriptId }),
  ]);

  return { meeting, transcript, transcriptContent };
};
