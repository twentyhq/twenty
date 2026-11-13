import { InboxThreadListFetchMoreTrigger } from '@/ai/components/InboxThreadListFetchMoreTrigger';
import { NavigationDrawerAiChatThreadSection } from '@/ai/components/NavigationDrawerAiChatThreadSection';
import { useAiChatThreadClick } from '@/ai/hooks/useAiChatThreadClick';
import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/ai/constants/InboxRecentThreadListSource';
import { useInboxThreadList } from '@/ai/hooks/useInboxThreadList';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';

const MOBILE_HOME_AI_CHAT_SECTION_ID = 'MobileHomeAiChat';

export const MobileHomeAiChatSection = () => {
  const { t } = useLingui();

  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
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
      <NavigationDrawerAiChatThreadSection
        sectionId={MOBILE_HOME_AI_CHAT_SECTION_ID}
        title={t`Conversations`}
        threads={threads}
        currentThreadId={currentAiChatThread}
        onThreadClick={handleThreadClick}
      />
      <InboxThreadListFetchMoreTrigger
        source={INBOX_RECENT_THREAD_LIST_SOURCE}
      />
    </>
  );
};
