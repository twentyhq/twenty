import { GOOGLE_DOCS_API_BASE_URL } from 'src/logic-functions/constants/google-docs-api.constant';
import { type GoogleDoc } from 'src/logic-functions/types/google-doc.type';
import { buildGoogleApiUrlOrThrow } from 'src/logic-functions/utils/build-google-api-url-or-throw.util';
import { fetchMeetJson } from 'src/logic-functions/utils/fetch-meet-json.util';
import { isGoogleDocUnreadableError } from 'src/logic-functions/utils/is-google-doc-unreadable-error.util';

export const getGoogleDoc = async ({
  accessToken,
  documentId,
}: {
  accessToken: string;
  documentId: string;
}): Promise<GoogleDoc | undefined> => {
  try {
    return await fetchMeetJson<GoogleDoc>({
      accessToken,
      url: buildGoogleApiUrlOrThrow({
        baseUrl: GOOGLE_DOCS_API_BASE_URL,
        path: `documents/${documentId}`,
        queryParameters: { includeTabsContent: 'true' },
      }),
    });
  } catch (error) {
    if (isGoogleDocUnreadableError(error)) {
      return undefined;
    }

    throw error;
  }
};
