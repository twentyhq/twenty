import { useCallback } from 'react';

import { type InboxSection } from '@/inbox/constants/InboxSections';
import { INBOX_ITEM_ORDER_LOCATION_STATE } from '@/inbox/constants/InboxItemOrderLocationState';
import { inboxItemOrderState } from '@/inbox/states/inboxItemOrderState';
import { getInboxItemPath } from '@/inbox/utils/getInboxItemPath';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { type InboxItem } from '~/generated/graphql';
import { useNavigate } from 'react-router-dom';

// The order the list was showing is captured on the way in, so paging through
// the focused view follows what the user saw rather than a list that keeps
// moving as items are resolved. The history entry is marked as coming from the
// list because the snapshot outlives the visit and a later direct link to the
// same section must not page through it.
export const useOpenInboxItemFullPage = (inboxSection: InboxSection) => {
  const navigate = useNavigate();
  const setInboxItemOrder = useSetAtomState(inboxItemOrderState);

  const openInboxItemFullPage = useCallback(
    (inboxItem: InboxItem, orderedInboxItems: InboxItem[]) => {
      setInboxItemOrder({
        inboxSectionSlug: inboxSection.slug,
        inboxItemIds: orderedInboxItems.map((item) => item.id),
      });

      navigate(getInboxItemPath(inboxSection, inboxItem.id), {
        state: INBOX_ITEM_ORDER_LOCATION_STATE,
      });
    },
    [navigate, setInboxItemOrder, inboxSection],
  );

  return { openInboxItemFullPage };
};
