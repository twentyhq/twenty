import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { INBOX_ITEM_ORDER_LOCATION_STATE } from '@/inbox/constants/InboxItemOrderLocationState';
import { inboxItemOrderState } from '@/inbox/states/inboxItemOrderState';
import { type InboxListLocation } from '@/inbox/types/InboxListLocation';
import { getInboxItemPath } from '@/inbox/utils/getInboxItemPath';
import { getInboxListKey } from '@/inbox/utils/getInboxListKey';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { type InboxItem } from '~/generated/graphql';

// The order the list was showing is captured on the way in, so paging follows
// what the user saw rather than a list that keeps moving as items are resolved.
// The entry is marked as coming from the list because the snapshot outlives the
// visit and a later direct link must not page through it.
export const useOpenInboxItem = (inboxListLocation: InboxListLocation) => {
  const navigate = useNavigate();
  const setInboxItemOrder = useSetAtomState(inboxItemOrderState);

  const openInboxItem = useCallback(
    (inboxItem: InboxItem, orderedInboxItems: InboxItem[]) => {
      setInboxItemOrder({
        inboxListKey: getInboxListKey(inboxListLocation),
        inboxItemIds: orderedInboxItems.map((item) => item.id),
      });

      navigate(
        getInboxItemPath({ ...inboxListLocation, inboxItemId: inboxItem.id }),
        { state: INBOX_ITEM_ORDER_LOCATION_STATE },
      );
    },
    [navigate, setInboxItemOrder, inboxListLocation],
  );

  return { openInboxItem };
};
