import { UnipileMessaging } from '@unipile/sdk';

import { requestUnipile } from 'src/unipile/utils/request-unipile.util';
import { getUnipileRequestOptions } from 'src/unipile/utils/get-unipile-request-options.util';

export const listUnipileInboxIds = async (
  accountId: string,
): Promise<string[]> => {
  const { data } = await requestUnipile('list inboxes', () =>
    new UnipileMessaging().getInboxesList({
      ...getUnipileRequestOptions(),
      path: { account_id: accountId },
    }),
  );

  return data.data.filter((inbox) => !inbox.disabled).map((inbox) => inbox.id);
};
