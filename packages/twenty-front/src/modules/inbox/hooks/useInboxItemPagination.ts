import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { INBOX_ITEM_ORDER_LOCATION_STATE } from '@/inbox/constants/InboxItemOrderLocationState';
import { inboxItemOrderState } from '@/inbox/states/inboxItemOrderState';
import { type InboxListLocation } from '@/inbox/types/InboxListLocation';
import { getInboxItemPath } from '@/inbox/utils/getInboxItemPath';
import { getInboxListKey } from '@/inbox/utils/getInboxListKey';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// Paging is over the order the list was showing when the item was opened, not
// over a live query.
export const useInboxItemPagination = ({
  inboxListLocation,
  inboxItemId,
}: {
  inboxListLocation: InboxListLocation;
  inboxItemId?: string;
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const inboxItemOrder = useAtomStateValue(inboxItemOrderState);

  const isFromInboxList =
    location.state?.isFromInboxList ===
    INBOX_ITEM_ORDER_LOCATION_STATE.isFromInboxList;

  // A snapshot taken in another list, or before a direct link into this one,
  // says nothing about where this item sits, so it is ignored.
  const inboxItemIds =
    isFromInboxList &&
    inboxItemOrder?.inboxListKey === getInboxListKey(inboxListLocation)
      ? inboxItemOrder.inboxItemIds
      : [];

  const currentIndex = isDefined(inboxItemId)
    ? inboxItemIds.indexOf(inboxItemId)
    : -1;
  const isInOrder = currentIndex !== -1;

  const previousInboxItemId = isInOrder
    ? inboxItemIds[currentIndex - 1]
    : undefined;
  const nextInboxItemId = isInOrder
    ? inboxItemIds[currentIndex + 1]
    : undefined;

  const navigateToInboxItem = useCallback(
    (targetInboxItemId?: string) => {
      if (!isDefined(targetInboxItemId)) {
        return;
      }

      navigate(
        getInboxItemPath({
          ...inboxListLocation,
          inboxItemId: targetInboxItemId,
        }),
        { state: INBOX_ITEM_ORDER_LOCATION_STATE },
      );
    },
    [navigate, inboxListLocation],
  );

  return {
    // An item reached by a direct link has no order to page through, so both
    // ends read as unavailable rather than jumping to a stranger's neighbour.
    hasPrevious: isDefined(previousInboxItemId),
    hasNext: isDefined(nextInboxItemId),
    position: isInOrder ? currentIndex + 1 : undefined,
    total: isInOrder ? inboxItemIds.length : undefined,
    goToPrevious: () => navigateToInboxItem(previousInboxItemId),
    goToNext: () => navigateToInboxItem(nextInboxItemId),
  };
};
