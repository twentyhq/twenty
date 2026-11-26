import { MEET_API_BASE_URL } from 'src/logic-functions/constants/meet-api.constant';
import { buildGoogleApiUrlOrThrow } from 'src/logic-functions/utils/build-google-api-url-or-throw.util';

export const buildMeetUrlOrThrow = ({
  path,
  queryParameters,
}: {
  path: string;
  queryParameters: Record<string, string | undefined>;
}): string =>
  buildGoogleApiUrlOrThrow({
    baseUrl: MEET_API_BASE_URL,
    path,
    queryParameters,
  });
