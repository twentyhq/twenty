import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useState } from 'react';
import { AgentChatThreadConversationType } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronDown, IconChevronUp } from 'twenty-ui/icon';

import { useAiChatPageThreadId } from '@/ai-chat/hooks/useAiChatPageThreadId';
import { useAiChatThreadClick } from '@/ai-chat/threads/hooks/useAiChatThreadClick';
import { InboxThreadListFetchMoreTrigger } from '@/inbox/components/InboxThreadListFetchMoreTrigger';
import { NavigationDrawerInboxThreadSection } from '@/inbox/components/NavigationDrawerInboxThreadSection';
import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/inbox/constants/InboxRecentThreadListSource';
import { INBOX_RECENT_THREADS_NAVIGATION_SECTION_ID } from '@/inbox/constants/InboxRecentThreadsNavigationSectionId';
import { useInboxThreadList } from '@/inbox/hooks/useInboxThreadList';
import { inboxFavoriteThreadsSelector } from '@/inbox/states/selectors/inboxFavoriteThreadsSelector';
import { NAVIGATION_MENU_SECTION_VISIBLE_ITEM_LIMIT } from '@/navigation-menu-item/common/constants/NavigationMenuSectionVisibleItemLimit';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

type NavigationMenuAiChatRecentsSectionProps = {
  headerAction?: ReactNode;
};

export const NavigationMenuAiChatRecentsSection = ({
  headerAction,
}: NavigationMenuAiChatRecentsSectionProps) => {
  const { t } = useLingui();
  const [isShowingAllThreads, setIsShowingAllThreads] = useState(false);
  const currentThreadId = useAiChatPageThreadId();
  const { handleThreadClick } = useAiChatThreadClick({
    shouldOpenInFullPage: true,
  });
  const isDirectMessageEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AGENT_CHAT_DIRECT_MESSAGE_IDENTITY_ENABLED,
  );
  const { threads, inboxThreadList } = useInboxThreadList(
    INBOX_RECENT_THREAD_LIST_SOURCE,
  );
  const favoriteThreadIds = new Set(
    useAtomStateValue(inboxFavoriteThreadsSelector).map(({ id }) => id),
  );
  const recentThreads = threads.filter(
    ({ id, conversationType }) =>
      !favoriteThreadIds.has(id) &&
      !(
        isDirectMessageEnabled &&
        conversationType === AgentChatThreadConversationType.DIRECT_MESSAGE
      ),
  );

  if (recentThreads.length === 0 && !isDefined(headerAction)) {
    return null;
  }

  const hasHiddenThreads =
    recentThreads.length > NAVIGATION_MENU_SECTION_VISIBLE_ITEM_LIMIT ||
    (inboxThreadList?.hasNextPage ?? false);

  const displayedThreads =
    hasHiddenThreads && !isShowingAllThreads
      ? recentThreads.slice(0, NAVIGATION_MENU_SECTION_VISIBLE_ITEM_LIMIT)
      : recentThreads;

  return (
    <NavigationDrawerInboxThreadSection
      sectionId={INBOX_RECENT_THREADS_NAVIGATION_SECTION_ID}
      title={t`Recent chats`}
      threads={displayedThreads}
      currentThreadId={currentThreadId}
      onThreadClick={handleThreadClick}
      headerAction={headerAction}
      footer={
        hasHiddenThreads && (
          <>
            {isShowingAllThreads && (
              <InboxThreadListFetchMoreTrigger
                source={INBOX_RECENT_THREAD_LIST_SOURCE}
              />
            )}
            <NavigationDrawerItem
              label={isShowingAllThreads ? t`See less` : t`See more`}
              Icon={isShowingAllThreads ? IconChevronUp : IconChevronDown}
              variant="tertiary"
              preventCollapseOnMobile
              triggerEvent="CLICK"
              onClick={() => setIsShowingAllThreads(!isShowingAllThreads)}
            />
          </>
        )
      }
    />
  );
};
