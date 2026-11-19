import { useLingui } from '@lingui/react/macro';
import { AgentChatThreadConversationType } from 'twenty-shared/ai';

import { useAiChatPageThreadId } from '@/ai-chat/hooks/useAiChatPageThreadId';
import { useAiChatThreadClick } from '@/ai-chat/hooks/useAiChatThreadClick';
import { NavigationDrawerInboxThreadSection } from '@/inbox/components/NavigationDrawerInboxThreadSection';
import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/inbox/constants/InboxRecentThreadListSource';
import { INBOX_RECENT_THREADS_MAX_COUNT } from '@/inbox/constants/InboxRecentThreadsMaxCount';
import { useInboxThreadList } from '@/inbox/hooks/useInboxThreadList';
import { inboxFavoriteThreadsSelector } from '@/inbox/states/selectors/inboxFavoriteThreadsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

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
  const isDirectMessageEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AGENT_CHAT_DIRECT_MESSAGE_IDENTITY_ENABLED,
  );
  const { threads } = useInboxThreadList(INBOX_RECENT_THREAD_LIST_SOURCE);
  const favoriteThreadIds = new Set(
    useAtomStateValue(inboxFavoriteThreadsSelector).map(({ id }) => id),
  );
  const recentThreads = threads
    .filter(
      ({ id, conversationType }) =>
        !favoriteThreadIds.has(id) &&
        !(
          isDirectMessageEnabled &&
          conversationType === AgentChatThreadConversationType.DIRECT_MESSAGE
        ),
    )
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
