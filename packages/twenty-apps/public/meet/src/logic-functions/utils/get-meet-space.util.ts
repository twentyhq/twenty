import { type MeetSpace } from 'src/logic-functions/types/meet-space.type';
import { buildMeetUrlOrThrow } from 'src/logic-functions/utils/build-meet-url-or-throw.util';
import { fetchMeetJson } from 'src/logic-functions/utils/fetch-meet-json.util';

export const getMeetSpace = ({
  accessToken,
  spaceName,
}: {
  accessToken: string;
  spaceName: string;
}): Promise<MeetSpace> =>
  fetchMeetJson<MeetSpace>({
    accessToken,
    url: buildMeetUrlOrThrow({ path: spaceName, queryParameters: {} }),
  });
