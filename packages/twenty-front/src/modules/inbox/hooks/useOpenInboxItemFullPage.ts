import { useCallback } from 'react';

import { type InboxSection } from '@/inbox/constants/InboxSections';
import { inboxItemOrderState } from '@/inbox/states/inboxItemOrderState';
import { getInboxItemPath } from '@/inbox/utils/getInboxItemPath';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { type InboxItem } from '~/generated/graphql';
import { useNavigate } from 'react-router-dom';

// The order the list was showing is captured on the way in, so paging through
// the focused view follows what the user saw rather than a list that keeps
// moving as items are resolved.
export const useOpenInboxItemFullPage = (inboxSection: InboxSection) => {
  const navigate = useNavigate();
  const setInboxItemOrder = useSetAtomState(inboxItemOrderState);

  const openInboxItemFullPage = useCallback(
    (inboxItem: InboxItem, orderedInboxItems: InboxItem[]) => {
      setInboxItemOrder({
        inboxSectionSlug: inboxSection.slug,
        inboxItemIds: orderedInboxItems.map((item) => item.id),
      });

      navigate(getInboxItemPath(inboxSection, inboxItem.id));
    },
    [navigate, setInboxItemOrder, inboxSection],
  );

  return { openInboxItemFullPage };
};
