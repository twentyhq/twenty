import { useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';

import { GET_MY_INBOX_ITEM } from '@/inbox/graphql/queries/getMyInboxItem';
import { useIsInboxEnabled } from '@/inbox/hooks/useIsInboxEnabled';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type InboxItem } from '~/generated/graphql';

// By id and not by scope, so an item keeps rendering after a transition moves
// it out of the scope the list was showing.
export const useInboxItem = (inboxItemId?: string) => {
  const apolloCoreClient = useApolloCoreClient();
  const isInboxEnabled = useIsInboxEnabled();

  const { data, loading } = useQuery<
    { myInboxItem: InboxItem | null },
    { inboxItemId: string }
  >(GET_MY_INBOX_ITEM, {
    client: apolloCoreClient,
    variables: { inboxItemId: inboxItemId ?? '' },
    skip: !isInboxEnabled || !isDefined(inboxItemId),
  });

  return {
    inboxItem: data?.myInboxItem ?? null,
    loading: loading && !isDefined(data),
  };
};
