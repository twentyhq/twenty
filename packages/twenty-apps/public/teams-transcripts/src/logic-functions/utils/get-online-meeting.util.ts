import { type GraphOnlineMeeting } from 'src/logic-functions/types/graph-online-meeting.type';
import { graphFetchJson } from 'src/logic-functions/utils/graph-fetch.util';

export const getOnlineMeeting = ({
  accessToken,
  organizerUserId,
  meetingId,
}: {
  accessToken: string;
  organizerUserId: string;
  meetingId: string;
}): Promise<GraphOnlineMeeting> =>
  graphFetchJson<GraphOnlineMeeting>({
    accessToken,
    url: `users/${encodeURIComponent(organizerUserId)}/onlineMeetings/${encodeURIComponent(meetingId)}?$select=id,subject,joinWebUrl,startDateTime,endDateTime`,
  });
