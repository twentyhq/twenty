import { isNonEmptyString } from '@sniptt/guards';

import { graphApiRequest } from 'src/logic-functions/data/graph-api-request.util';
import { type MessengerPage } from 'src/logic-functions/types/messenger-page.type';

type MessengerPageList = {
  data: MessengerPage[];
  paging?: { cursors?: { after?: string }; next?: string };
};

// Pages assigned to the system user; their tokens are derived from it and never stored
export const listMessengerPages = async (
  accessToken: string,
): Promise<MessengerPage[]> => {
  const pages: MessengerPage[] = [];
  let after: string | undefined;

  do {
    const { data, paging } = await graphApiRequest<MessengerPageList>({
      accessToken,
      method: 'GET',
      path: 'me/accounts',
      query: {
        fields: 'id,name,access_token',
        limit: '100',
        ...(isNonEmptyString(after) ? { after } : {}),
      },
    });

    pages.push(...data);
    after = isNonEmptyString(paging?.next) ? paging?.cursors?.after : undefined;
  } while (isNonEmptyString(after));

  return pages;
};
