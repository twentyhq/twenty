import { GOOGLE_DOCS_API_BASE_URL } from 'src/logic-functions/constants/google-docs-api.constant';
import { buildGoogleApiUrlOrThrow } from 'src/logic-functions/utils/build-google-api-url-or-throw.util';
import { fetchMeetJson } from 'src/logic-functions/utils/fetch-meet-json.util';
import { isGoogleDocUnreadableError } from 'src/logic-functions/utils/is-google-doc-unreadable-error.util';

export const getGoogleDocTitle = async ({
  accessToken,
  documentId,
}: {
  accessToken: string;
  documentId: string;
}): Promise<string | undefined> => {
  try {
    const document = await fetchMeetJson<{ title?: string }>({
      accessToken,
      url: buildGoogleApiUrlOrThrow({
        baseUrl: GOOGLE_DOCS_API_BASE_URL,
        path: `documents/${documentId}`,
        queryParameters: { fields: 'title' },
      }),
    });

    return document.title;
  } catch (error) {
    if (isGoogleDocUnreadableError(error)) {
      return undefined;
    }

    throw error;
  }
};
