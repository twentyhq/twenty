import { InboxThreadListFetchMoreTrigger } from '@/inbox/components/InboxThreadListFetchMoreTrigger';
import { NavigationDrawerInboxThreadSection } from '@/inbox/components/NavigationDrawerInboxThreadSection';
import { useAiChatThreadClick } from '@/ai-chat/threads/hooks/useAiChatThreadClick';
import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/inbox/constants/InboxRecentThreadListSource';
import { useInboxThreadList } from '@/inbox/hooks/useInboxThreadList';
import { useAiChatPageThreadId } from '@/ai-chat/hooks/useAiChatPageThreadId';
import { useLingui } from '@lingui/react/macro';

const MOBILE_HOME_AI_CHAT_SECTION_ID = 'MobileHomeAiChat';

export const MobileHomeInboxSection = () => {
  const { t } = useLingui();

  const aiChatPageThreadId = useAiChatPageThreadId();
  const { handleThreadClick } = useAiChatThreadClick({
    resetNavigationStack: true,
  });
  const { threads } = useInboxThreadList(INBOX_RECENT_THREAD_LIST_SOURCE);

  // Earlier pages can hold only chats filtered out of this list, so an empty
  // list keeps fetching until it finds some or runs out
  if (threads.length === 0) {
    return (
      <InboxThreadListFetchMoreTrigger
        source={INBOX_RECENT_THREAD_LIST_SOURCE}
      />
    );
  }

  return (
    <>
      <NavigationDrawerInboxThreadSection
        sectionId={MOBILE_HOME_AI_CHAT_SECTION_ID}
        title={t`Conversations`}
        threads={threads}
        currentThreadId={aiChatPageThreadId}
        onThreadClick={handleThreadClick}
      />
      <InboxThreadListFetchMoreTrigger
        source={INBOX_RECENT_THREAD_LIST_SOURCE}
      />
    </>
  );
};
