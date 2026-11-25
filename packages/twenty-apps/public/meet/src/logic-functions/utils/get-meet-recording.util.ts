import { type MeetRecording } from 'src/logic-functions/types/meet-recording.type';
import { buildMeetUrlOrThrow } from 'src/logic-functions/utils/build-meet-url-or-throw.util';
import { fetchMeetJson } from 'src/logic-functions/utils/fetch-meet-json.util';

export const getMeetRecording = ({
  accessToken,
  recordingName,
}: {
  accessToken: string;
  recordingName: string;
}): Promise<MeetRecording> =>
  fetchMeetJson<MeetRecording>({
    accessToken,
    url: buildMeetUrlOrThrow({
      path: recordingName,
      queryParameters: {},
    }),
  });
