import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AppPath } from 'twenty-shared/types';

import { type InboxSection } from '@/inbox/constants/InboxSections';
import { inboxItemOrderState } from '@/inbox/states/inboxItemOrderState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useNavigateApp } from '~/hooks/useNavigateApp';

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
  const navigate = useNavigateApp();
  const inboxItemOrder = useAtomStateValue(inboxItemOrderState);

  const currentIndex = isDefined(inboxItemId)
    ? inboxItemOrder.indexOf(inboxItemId)
    : -1;
  const isInOrder = currentIndex !== -1;

  const previousInboxItemId = isInOrder
    ? inboxItemOrder[currentIndex - 1]
    : undefined;
  const nextInboxItemId = isInOrder
    ? inboxItemOrder[currentIndex + 1]
    : undefined;

  const navigateToInboxItem = useCallback(
    (targetInboxItemId?: string) => {
      if (!isDefined(targetInboxItemId)) {
        return;
      }

      navigate(AppPath.InboxItemPage, {
        inboxSectionSlug: inboxSection.slug,
        inboxItemId: targetInboxItemId,
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
    total: isInOrder ? inboxItemOrder.length : undefined,
    goToPrevious: () => navigateToInboxItem(previousInboxItemId),
    goToNext: () => navigateToInboxItem(nextInboxItemId),
  };
};
