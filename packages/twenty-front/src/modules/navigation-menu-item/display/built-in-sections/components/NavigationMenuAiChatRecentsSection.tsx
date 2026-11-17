import { useLingui } from '@lingui/react/macro';

import { useAiChatPageThreadId } from '@/ai/hooks/useAiChatPageThreadId';
import { useAiChatThreadClick } from '@/ai/hooks/useAiChatThreadClick';
import { NavigationDrawerInboxThreadSection } from '@/inbox/components/NavigationDrawerInboxThreadSection';
import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/inbox/constants/InboxRecentThreadListSource';
import { INBOX_RECENT_THREADS_MAX_COUNT } from '@/inbox/constants/InboxRecentThreadsMaxCount';
import { useInboxThreadList } from '@/inbox/hooks/useInboxThreadList';
import { inboxFavoriteThreadsSelector } from '@/inbox/states/selectors/inboxFavoriteThreadsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type NavigationMenuAiChatRecentsSectionProps = {
  sectionId: string;
};

export const NavigationMenuAiChatRecentsSection = ({
  sectionId,
}: NavigationMenuAiChatRecentsSectionProps) => {
  const { t } = useLingui();
  const currentThreadId = useAiChatPageThreadId();
  const { handleThreadClick } = useAiChatThreadClick({
    shouldOpenInFullPage: true,
  });
  const { threads } = useInboxThreadList(INBOX_RECENT_THREAD_LIST_SOURCE);
  const favoriteThreadIds = new Set(
    useAtomStateValue(inboxFavoriteThreadsSelector).map(({ id }) => id),
  );
  const recentThreads = threads
    .filter(({ id }) => !favoriteThreadIds.has(id))
    .slice(0, INBOX_RECENT_THREADS_MAX_COUNT);

  if (recentThreads.length === 0) {
    return null;
  }

  return (
    <NavigationDrawerInboxThreadSection
      sectionId={`navigation-menu-section-${sectionId}`}
      title={t`Recent chats`}
      threads={recentThreads}
      currentThreadId={currentThreadId}
      onThreadClick={handleThreadClick}
    />
  );
};
