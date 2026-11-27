import { type MeetConferenceRecord } from 'src/logic-functions/types/meet-conference-record.type';
import { buildMeetUrlOrThrow } from 'src/logic-functions/utils/build-meet-url-or-throw.util';
import { fetchMeetJson } from 'src/logic-functions/utils/fetch-meet-json.util';

export const getMeetConferenceRecord = ({
  accessToken,
  conferenceRecordName,
}: {
  accessToken: string;
  conferenceRecordName: string;
}): Promise<MeetConferenceRecord> =>
  fetchMeetJson<MeetConferenceRecord>({
    accessToken,
    url: buildMeetUrlOrThrow({
      path: conferenceRecordName,
      queryParameters: {},
    }),
  });
