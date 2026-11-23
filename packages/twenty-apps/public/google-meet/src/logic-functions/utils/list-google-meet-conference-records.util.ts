import { type GoogleMeetConferenceRecord } from 'src/logic-functions/types/google-meet-conference-record.type';
import { buildGoogleMeetConferenceRecordFilter } from 'src/logic-functions/utils/build-google-meet-conference-record-filter.util';
import { listGoogleMeetCollection } from 'src/logic-functions/utils/list-google-meet-collection.util';

export const listGoogleMeetConferenceRecords = ({
  accessToken,
  startedAfter,
  startedBefore,
}: {
  accessToken: string;
  startedAfter: Date;
  startedBefore: Date;
}): Promise<GoogleMeetConferenceRecord[]> =>
  listGoogleMeetCollection<'conferenceRecords', GoogleMeetConferenceRecord>({
    accessToken,
    path: 'conferenceRecords',
    collectionKey: 'conferenceRecords',
    filter: buildGoogleMeetConferenceRecordFilter({
      startedAfter,
      startedBefore,
    }),
  });
