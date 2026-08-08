import { useCallback } from 'react';

import { AppPath } from 'twenty-shared/types';

import { type InboxSection } from '@/inbox/constants/InboxSections';
import { inboxItemOrderState } from '@/inbox/states/inboxItemOrderState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { type InboxItem } from '~/generated/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';

// The order the list was showing is captured on the way in, so paging through
// the focused view follows what the user saw rather than a list that keeps
// moving as items are resolved.
export const useOpenInboxItemFullPage = (inboxSection: InboxSection) => {
  const navigate = useNavigateApp();
  const setInboxItemOrder = useSetAtomState(inboxItemOrderState);

  const openInboxItemFullPage = useCallback(
    (inboxItem: InboxItem, orderedInboxItems: InboxItem[]) => {
      setInboxItemOrder(orderedInboxItems.map((item) => item.id));

      navigate(AppPath.InboxItemPage, {
        inboxSectionSlug: inboxSection.slug,
        inboxItemId: inboxItem.id,
      });
    },
    [navigate, setInboxItemOrder, inboxSection],
  );

  return { openInboxItemFullPage };
};
