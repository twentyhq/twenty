import { type MeetSmartNote } from 'src/logic-functions/types/meet-smart-note.type';
import { listMeetCollection } from 'src/logic-functions/utils/list-meet-collection.util';

export const listMeetSmartNotes = ({
  accessToken,
  conferenceRecordName,
}: {
  accessToken: string;
  conferenceRecordName: string;
}): Promise<MeetSmartNote[]> =>
  listMeetCollection<'smartNotes', MeetSmartNote>({
    accessToken,
    path: `${conferenceRecordName}/smartNotes`,
    collectionKey: 'smartNotes',
  });
