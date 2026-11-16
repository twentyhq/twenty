import { matchPath, useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';

import { aiChatThreadIsDirectMessageFamilySelector } from '@/ai/states/selectors/aiChatThreadIsDirectMessageFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

export const useIsInboxShowingDirectMessage = () => {
  const location = useLocation();
  const inboxThreadId =
    matchPath(AppPath.AiChatInbox, location.pathname)?.params.threadId ?? null;

  return useAtomFamilySelectorValue(
    aiChatThreadIsDirectMessageFamilySelector,
    inboxThreadId,
  );
};
