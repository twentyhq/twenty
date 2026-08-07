import { useQuery } from '@apollo/client/react';

import { GET_MY_INBOX_ITEMS } from '@/inbox/graphql/queries/getMyInboxItems';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type InboxItem, type InboxItemScope } from '~/generated/graphql';

export const useInboxItemById = (
  inboxItemId: string | null,
  scope?: InboxItemScope,
) => {
  const apolloCoreClient = useApolloCoreClient();

  const { data, loading } = useQuery<
    { myInboxItems: InboxItem[] },
    { scope?: InboxItemScope }
  >(GET_MY_INBOX_ITEMS, {
    client: apolloCoreClient,
    variables: { scope },
    skip: inboxItemId === null,
  });

  const inboxItem =
    data?.myInboxItems.find(
      (candidateInboxItem) => candidateInboxItem.id === inboxItemId,
    ) ?? null;

  return { inboxItem, loading };
};
