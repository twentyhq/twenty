import { type GoogleMeetSmartNote } from 'src/logic-functions/types/google-meet-smart-note.type';
import { listGoogleMeetCollection } from 'src/logic-functions/utils/list-google-meet-collection.util';

export const listGoogleMeetSmartNotes = ({
  accessToken,
  conferenceRecordName,
}: {
  accessToken: string;
  conferenceRecordName: string;
}): Promise<GoogleMeetSmartNote[]> =>
  listGoogleMeetCollection<'smartNotes', GoogleMeetSmartNote>({
    accessToken,
    path: `${conferenceRecordName}/smartNotes`,
    collectionKey: 'smartNotes',
  });
