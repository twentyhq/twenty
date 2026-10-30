import { UnipileMessaging } from '@unipile/sdk';

import { getUnipileRequestOptions } from 'src/unipile/utils/get-unipile-request-options.util';

// LinkedIn keeps classic, Sales Navigator and Recruiter chats in separate inboxes
export const listUnipileInboxIds = async (
  accountId: string,
): Promise<string[]> => {
  const { data } = await new UnipileMessaging().getInboxesList({
    ...getUnipileRequestOptions(),
    path: { account_id: accountId },
  });

  return data.data.filter((inbox) => !inbox.disabled).map((inbox) => inbox.id);
};
