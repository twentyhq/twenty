import { InboxThreadListFetchMoreTrigger } from '@/ai/components/AgentChatThreadListFetchMoreTrigger';
import { NavigationDrawerInboxThreadSection } from '@/ai/components/NavigationDrawerAiChatThreadSection';
import { useInboxThreadClick } from '@/ai/hooks/useAiChatThreadClick';
import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/ai/constants/AgentChatRecentThreadListSource';
import { useInboxThreadList } from '@/ai/hooks/useAgentChatThreadList';
import { currentInboxThreadState } from '@/ai/states/currentAiChatThreadState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';

const MOBILE_HOME_INBOX_SECTION_ID = 'MobileHomeAiChat';

export const MobileHomeInboxSection = () => {
  const { t } = useLingui();

  const currentInboxThread = useAtomStateValue(currentInboxThreadState);
  const { handleThreadClick } = useInboxThreadClick({
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
        sectionId={MOBILE_HOME_INBOX_SECTION_ID}
        title={t`Conversations`}
        threads={threads}
        currentThreadId={currentInboxThread}
        onThreadClick={handleThreadClick}
      />
      <InboxThreadListFetchMoreTrigger
        source={INBOX_RECENT_THREAD_LIST_SOURCE}
      />
    </>
  );
};
