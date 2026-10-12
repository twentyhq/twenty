import { type GraphOnlineMeeting } from 'src/features/transcripts/logic-functions/types/graph-online-meeting.type';
import { fetchGraphJson } from 'src/features/transcripts/logic-functions/utils/fetch-graph-json';

export const getMeetingById = ({
  accessToken,
  meetingId,
}: {
  accessToken: string;
  meetingId: string;
}): Promise<GraphOnlineMeeting> =>
  fetchGraphJson<GraphOnlineMeeting>({
    accessToken,
    url: `me/onlineMeetings/${encodeURIComponent(meetingId)}`,
  });
