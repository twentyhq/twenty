import { InboxThreadListFetchMoreTrigger } from '@/ai/components/InboxThreadListFetchMoreTrigger';
import { NavigationDrawerInboxThreadSection } from '@/ai/components/NavigationDrawerInboxThreadSection';
import { useInboxThreadClick } from '@/ai/hooks/useInboxThreadClick';
import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/ai/constants/InboxRecentThreadListSource';
import { useInboxThreadList } from '@/ai/hooks/useInboxThreadList';
import { currentInboxThreadState } from '@/ai/states/currentInboxThreadState';
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
