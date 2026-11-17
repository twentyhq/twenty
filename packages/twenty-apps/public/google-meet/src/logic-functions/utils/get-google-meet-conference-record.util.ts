import { type GoogleMeetConferenceRecord } from 'src/logic-functions/types/google-meet-conference-record.type';
import { buildGoogleMeetUrlOrThrow } from 'src/logic-functions/utils/build-google-meet-url-or-throw.util';
import { fetchGoogleMeetJson } from 'src/logic-functions/utils/fetch-google-meet-json.util';

export const getGoogleMeetConferenceRecord = ({
  accessToken,
  conferenceRecordName,
}: {
  accessToken: string;
  conferenceRecordName: string;
}): Promise<GoogleMeetConferenceRecord> =>
  fetchGoogleMeetJson<GoogleMeetConferenceRecord>({
    accessToken,
    url: buildGoogleMeetUrlOrThrow({
      path: conferenceRecordName,
      queryParameters: {},
    }),
  });
