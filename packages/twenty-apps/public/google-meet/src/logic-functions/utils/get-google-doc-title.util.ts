import { GOOGLE_DOCS_API_BASE_URL } from 'src/logic-functions/constants/google-docs-api.constant';
import { buildGoogleApiUrlOrThrow } from 'src/logic-functions/utils/build-google-api-url-or-throw.util';
import { fetchGoogleMeetJson } from 'src/logic-functions/utils/fetch-google-meet-json.util';

export const getGoogleDocTitle = async ({
  accessToken,
  documentId,
}: {
  accessToken: string;
  documentId: string;
}): Promise<string | undefined> => {
  const document = await fetchGoogleMeetJson<{ title?: string }>({
    accessToken,
    url: buildGoogleApiUrlOrThrow({
      baseUrl: GOOGLE_DOCS_API_BASE_URL,
      path: `documents/${documentId}`,
      queryParameters: { fields: 'title' },
    }),
  });

  return document.title;
};
