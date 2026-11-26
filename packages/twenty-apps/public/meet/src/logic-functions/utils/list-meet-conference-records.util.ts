import { type MeetConferenceRecord } from 'src/logic-functions/types/meet-conference-record.type';
import { buildMeetConferenceRecordFilter } from 'src/logic-functions/utils/build-meet-conference-record-filter.util';
import { listMeetCollection } from 'src/logic-functions/utils/list-meet-collection.util';

export const listMeetConferenceRecords = ({
  accessToken,
  startedAfter,
  startedBefore,
}: {
  accessToken: string;
  startedAfter: Date;
  startedBefore: Date;
}): Promise<MeetConferenceRecord[]> =>
  listMeetCollection<'conferenceRecords', MeetConferenceRecord>({
    accessToken,
    path: 'conferenceRecords',
    collectionKey: 'conferenceRecords',
    filter: buildMeetConferenceRecordFilter({
      startedAfter,
      startedBefore,
    }),
  });
