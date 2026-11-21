import { isDefined } from 'twenty-sdk/utils';

import { getMessengerAccessTokenOrThrow } from 'src/logic-functions/data/get-messenger-access-token-or-throw.util';
import { listMessengerPages } from 'src/logic-functions/data/list-messenger-pages.util';
import { withConnectionAuthFailureReport } from 'src/logic-functions/data/with-connection-auth-failure-report.util';

export const getPageAccessTokenOrThrow = async ({
  connectedAccountId,
  pageId,
}: {
  connectedAccountId: string;
  pageId: string;
}): Promise<string> => {
  const accessToken = await getMessengerAccessTokenOrThrow(connectedAccountId);
  const pages = await withConnectionAuthFailureReport(connectedAccountId, () =>
    listMessengerPages(accessToken),
  );
  const page = pages.find(({ id }) => id === pageId);

  if (!isDefined(page)) {
    throw new Error(
      `The Messenger connection no longer has access to Page ${pageId}. Assign the Page to the system user again.`,
    );
  }

  return page.access_token;
};
