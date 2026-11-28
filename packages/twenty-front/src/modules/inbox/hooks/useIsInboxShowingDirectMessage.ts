import { aiChatThreadIsDirectMessageFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadIsDirectMessageFamilySelector';
import { useInboxRouteThreadId } from '@/inbox/hooks/useInboxRouteThreadId';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

export const useIsInboxShowingDirectMessage = () => {
  const inboxThreadId = useInboxRouteThreadId() ?? null;

  return useAtomFamilySelectorValue(
    aiChatThreadIsDirectMessageFamilySelector,
    inboxThreadId,
  );
};
