import { matchPath, useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';

import { inboxThreadIsDirectMessageFamilySelector } from '@/inbox/states/selectors/inboxThreadIsDirectMessageFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

export const useIsInboxShowingDirectMessage = () => {
  const location = useLocation();
  const inboxThreadId =
    matchPath(AppPath.AiChatInbox, location.pathname)?.params.threadId ?? null;

  return useAtomFamilySelectorValue(
    inboxThreadIsDirectMessageFamilySelector,
    inboxThreadId,
  );
};
