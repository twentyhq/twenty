import { UnipileMessaging } from '@unipile/sdk';

import { withUnipileErrorContext } from 'src/unipile/utils/with-unipile-error-context.util';
import { getUnipileRequestOptions } from 'src/unipile/utils/get-unipile-request-options.util';

// LinkedIn keeps classic, Sales Navigator and Recruiter chats in separate inboxes
export const listUnipileInboxIds = async (
  accountId: string,
): Promise<string[]> => {
  const { data } = await withUnipileErrorContext('list inboxes', () =>
    new UnipileMessaging().getInboxesList({
      ...getUnipileRequestOptions(),
      path: { account_id: accountId },
    }),
  );

  return data.data.filter((inbox) => !inbox.disabled).map((inbox) => inbox.id);
};
