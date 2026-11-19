import { GOOGLE_MEET_API_BASE_URL } from 'src/logic-functions/constants/google-meet-api.constant';
import { buildGoogleApiUrlOrThrow } from 'src/logic-functions/utils/build-google-api-url-or-throw.util';

export const buildGoogleMeetUrlOrThrow = ({
  path,
  queryParameters,
}: {
  path: string;
  queryParameters: Record<string, string | undefined>;
}): string =>
  buildGoogleApiUrlOrThrow({
    baseUrl: GOOGLE_MEET_API_BASE_URL,
    path,
    queryParameters,
  });
