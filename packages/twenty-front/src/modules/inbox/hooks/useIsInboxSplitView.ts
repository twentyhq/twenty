import { useIsMobile } from 'twenty-ui/utilities';

import { INBOX_LAYOUT } from '@/inbox/constants/InboxLayout';
import { inboxLayoutState } from '@/inbox/states/inboxLayoutState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// A phone has room for the list or a chat, never both
export const useIsInboxSplitView = () => {
  const isMobile = useIsMobile();
  const inboxLayout = useAtomStateValue(inboxLayoutState);

  return !isMobile && inboxLayout === INBOX_LAYOUT.SPLIT_VIEW;
};
