import { type GoogleMeetParticipant } from 'src/logic-functions/types/google-meet-participant.type';
import { listGoogleMeetCollection } from 'src/logic-functions/utils/list-google-meet-collection.util';

export const listGoogleMeetParticipants = ({
  accessToken,
  conferenceRecordName,
}: {
  accessToken: string;
  conferenceRecordName: string;
}): Promise<GoogleMeetParticipant[]> =>
  listGoogleMeetCollection<'participants', GoogleMeetParticipant>({
    accessToken,
    path: `${conferenceRecordName}/participants`,
    collectionKey: 'participants',
  });
