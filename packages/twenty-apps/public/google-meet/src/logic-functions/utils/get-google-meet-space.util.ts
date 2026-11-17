import { type GoogleMeetSpace } from 'src/logic-functions/types/google-meet-space.type';
import { buildGoogleMeetUrlOrThrow } from 'src/logic-functions/utils/build-google-meet-url-or-throw.util';
import { fetchGoogleMeetJson } from 'src/logic-functions/utils/fetch-google-meet-json.util';

export const getGoogleMeetSpace = ({
  accessToken,
  spaceName,
}: {
  accessToken: string;
  spaceName: string;
}): Promise<GoogleMeetSpace> =>
  fetchGoogleMeetJson<GoogleMeetSpace>({
    accessToken,
    url: buildGoogleMeetUrlOrThrow({ path: spaceName, queryParameters: {} }),
  });
