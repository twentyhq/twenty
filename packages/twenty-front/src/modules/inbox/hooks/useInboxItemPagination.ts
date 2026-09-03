import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { INBOX_ITEM_ORDER_LOCATION_STATE } from '@/inbox/constants/InboxItemOrderLocationState';
import { type InboxSection } from '@/inbox/constants/InboxSections';
import { inboxItemOrderState } from '@/inbox/states/inboxItemOrderState';
import { getInboxItemPath } from '@/inbox/utils/getInboxItemPath';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLocation, useNavigate } from 'react-router-dom';

// Paging is over the order the list was showing when the item was opened, not
// over a live query. Inbox items are core-schema and paged by myInboxItems, so
// none of the record show pagination applies.
export const useInboxItemPagination = ({
  inboxSection,
  inboxItemId,
}: {
  inboxSection: InboxSection;
  inboxItemId?: string;
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const inboxItemOrder = useAtomStateValue(inboxItemOrderState);

  const isFromInboxList =
    location.state?.isFromInboxList ===
    INBOX_ITEM_ORDER_LOCATION_STATE.isFromInboxList;

  // A snapshot taken in another section, or before a direct link into this
  // one, says nothing about where this item sits, so it is ignored rather
  // than paged through
  const inboxItemIds =
    isFromInboxList && inboxItemOrder?.inboxSectionSlug === inboxSection.slug
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

      navigate(getInboxItemPath(inboxSection, targetInboxItemId), {
        state: INBOX_ITEM_ORDER_LOCATION_STATE,
      });
    },
    [navigate, inboxSection],
  );

  return {
    // An item reached by a direct link has no order to page through, so both
    // ends read as unavailable rather than jumping to a stranger's neighbour
    hasPrevious: isDefined(previousInboxItemId),
    hasNext: isDefined(nextInboxItemId),
    position: isInOrder ? currentIndex + 1 : undefined,
    total: isInOrder ? inboxItemIds.length : undefined,
    goToPrevious: () => navigateToInboxItem(previousInboxItemId),
    goToNext: () => navigateToInboxItem(nextInboxItemId),
  };
};
