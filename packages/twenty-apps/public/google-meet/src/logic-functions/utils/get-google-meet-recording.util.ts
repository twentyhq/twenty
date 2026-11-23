import { type GoogleMeetRecording } from 'src/logic-functions/types/google-meet-recording.type';
import { buildGoogleMeetUrlOrThrow } from 'src/logic-functions/utils/build-google-meet-url-or-throw.util';
import { fetchGoogleMeetJson } from 'src/logic-functions/utils/fetch-google-meet-json.util';

export const getGoogleMeetRecording = ({
  accessToken,
  recordingName,
}: {
  accessToken: string;
  recordingName: string;
}): Promise<GoogleMeetRecording> =>
  fetchGoogleMeetJson<GoogleMeetRecording>({
    accessToken,
    url: buildGoogleMeetUrlOrThrow({
      path: recordingName,
      queryParameters: {},
    }),
  });
