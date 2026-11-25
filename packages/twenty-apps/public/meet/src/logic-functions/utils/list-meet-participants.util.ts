import { type MeetParticipant } from 'src/logic-functions/types/meet-participant.type';
import { listMeetCollection } from 'src/logic-functions/utils/list-meet-collection.util';

export const listMeetParticipants = ({
  accessToken,
  conferenceRecordName,
}: {
  accessToken: string;
  conferenceRecordName: string;
}): Promise<MeetParticipant[]> =>
  listMeetCollection<'participants', MeetParticipant>({
    accessToken,
    path: `${conferenceRecordName}/participants`,
    collectionKey: 'participants',
  });
