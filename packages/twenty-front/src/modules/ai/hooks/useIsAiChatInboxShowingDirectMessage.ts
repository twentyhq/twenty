import { matchPath, useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';

import { agentChatThreadIsDirectMessageFamilySelector } from '@/ai/states/selectors/agentChatThreadIsDirectMessageFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

export const useIsAiChatInboxShowingDirectMessage = () => {
  const location = useLocation();
  const inboxThreadId =
    matchPath(AppPath.AiChatInbox, location.pathname)?.params.threadId ?? null;

  return useAtomFamilySelectorValue(
    agentChatThreadIsDirectMessageFamilySelector,
    inboxThreadId,
  );
};
