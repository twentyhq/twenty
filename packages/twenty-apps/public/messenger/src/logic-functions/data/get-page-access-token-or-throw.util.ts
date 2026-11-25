import { isNonEmptyString } from '@sniptt/guards';

import { getMessengerAccessTokenOrThrow } from 'src/logic-functions/data/get-messenger-access-token-or-throw.util';
import { GraphApiError } from 'src/logic-functions/data/graph-api.error';
import { graphApiRequest } from 'src/logic-functions/data/graph-api-request.util';
import { withConnectionAuthFailureReport } from 'src/logic-functions/data/with-connection-auth-failure-report.util';

// https://developers.facebook.com/docs/graph-api/guides/error-handling: also returned for a Page the token cannot see
const GRAPH_API_OBJECT_NOT_FOUND_ERROR_CODE = 100;

const fetchPageAccessToken = async ({
  accessToken,
  pageId,
}: {
  accessToken: string;
  pageId: string;
}): Promise<string | undefined> => {
  try {
    const { access_token } = await graphApiRequest<{ access_token?: string }>({
      accessToken,
      method: 'GET',
      path: pageId,
      query: { fields: 'access_token' },
    });

    return access_token;
  } catch (error) {
    if (
      error instanceof GraphApiError &&
      error.code === GRAPH_API_OBJECT_NOT_FOUND_ERROR_CODE
    ) {
      return undefined;
    }

    throw error;
  }
};

// asks for the one Page rather than listing them all, since this runs on every send and import
export const getPageAccessTokenOrThrow = async ({
  connectedAccountId,
  pageId,
}: {
  connectedAccountId: string;
  pageId: string;
}): Promise<string> => {
  const accessToken = await getMessengerAccessTokenOrThrow(connectedAccountId);
  const pageAccessToken = await withConnectionAuthFailureReport(
    connectedAccountId,
    () => fetchPageAccessToken({ accessToken, pageId }),
  );

  if (!isNonEmptyString(pageAccessToken)) {
    throw new Error(
      `The Messenger connection no longer has access to Page ${pageId}. Assign the Page to the system user again.`,
    );
  }

  return pageAccessToken;
};
