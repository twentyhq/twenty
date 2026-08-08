import { useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';

import { GET_MY_INBOX_ITEM } from '@/inbox/graphql/queries/getMyInboxItem';
import { useIsInboxEnabled } from '@/inbox/hooks/useIsInboxEnabled';
import { selectedInboxItemIdState } from '@/inbox/states/selectedInboxItemIdState';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type InboxItem } from '~/generated/graphql';

// The context bar lives in the side panel, which is mounted app wide, so it
// looks its item up by id rather than having one threaded down. By id and not
// by scope, so an item keeps showing after a transition moves it out of the
// scope the list was showing.
export const useSelectedInboxItem = () => {
  const apolloCoreClient = useApolloCoreClient();
  const isInboxEnabled = useIsInboxEnabled();
  const selectedInboxItemId = useAtomStateValue(selectedInboxItemIdState);

  const { data } = useQuery<
    { myInboxItem: InboxItem | null },
    { inboxItemId: string }
  >(GET_MY_INBOX_ITEM, {
    client: apolloCoreClient,
    variables: { inboxItemId: selectedInboxItemId ?? '' },
    skip: !isInboxEnabled || !isDefined(selectedInboxItemId),
  });

  return { selectedInboxItem: data?.myInboxItem ?? null };
};
