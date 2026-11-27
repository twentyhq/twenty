import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AiChatSkeletonLoader } from '@/ai-chat/components/AiChatSkeletonLoader';
import { useAiChatPageThreadId } from '@/ai-chat/hooks/useAiChatPageThreadId';
import { useAiChatThreadClick } from '@/ai-chat/threads/hooks/useAiChatThreadClick';
import { NavigationDrawerInboxThreadItem } from '@/inbox/components/NavigationDrawerInboxThreadItem';
import { InboxThreadListFetchMoreTrigger } from '@/inbox/components/InboxThreadListFetchMoreTrigger';
import { NavigationDrawerInboxThreadSection } from '@/inbox/components/NavigationDrawerInboxThreadSection';
import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/inbox/constants/InboxRecentThreadListSource';
import { INBOX_RECENTS_NAVIGATION_SECTION_ID } from '@/inbox/constants/InboxRecentsNavigationSectionId';
import { useInboxThreadList } from '@/inbox/hooks/useInboxThreadList';
import { inboxFavoriteThreadsSelector } from '@/inbox/states/selectors/inboxFavoriteThreadsSelector';
import { filterInboxRecentThreads } from '@/inbox/utils/filterInboxRecentThreads';
import { NavigationMenuSectionSeeMore } from '@/navigation-menu-item/display/sections/components/NavigationMenuSectionSeeMore';
import { StyledNavigationMenuSectionHiddenItems } from '@/navigation-menu-item/display/sections/components/StyledNavigationMenuSectionHiddenItems';
import { getNavigationSectionVisibleItems } from '@/navigation-menu-item/display/utils/getNavigationSectionVisibleItems';
import { useIsNavigationDrawerContentExpanded } from '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

type NavigationMenuAiChatRecentsSectionProps = {
  visibleItemLimit?: number | null;
  headerAction?: ReactNode;
};

export const NavigationMenuAiChatRecentsSection = ({
  visibleItemLimit,
  headerAction,
}: NavigationMenuAiChatRecentsSectionProps) => {
  const { t } = useLingui();
  const currentThreadId = useAiChatPageThreadId();
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const { handleThreadClick } = useAiChatThreadClick(
    isAiChatInboxEnabled
      ? { shouldOpenInFullPage: true }
      : { resetNavigationStack: true },
  );
  const isExpanded = useIsNavigationDrawerContentExpanded();
  const { threads, inboxThreadList, isLoading } = useInboxThreadList(
    INBOX_RECENT_THREAD_LIST_SOURCE,
  );
  const inboxFavoriteThreads = useAtomStateValue(inboxFavoriteThreadsSelector);
  const recentThreads = filterInboxRecentThreads({
    threads,
    favoriteThreads: inboxFavoriteThreads,
    shouldExcludeDirectMessages: false,
  });

  if (isLoading && !isDefined(headerAction)) {
    return isExpanded ? <AiChatSkeletonLoader /> : null;
  }

  if (recentThreads.length === 0 && !isDefined(headerAction)) {
    return (
      <InboxThreadListFetchMoreTrigger
        key={inboxThreadList?.endCursor ?? ''}
        source={INBOX_RECENT_THREAD_LIST_SOURCE}
      />
    );
  }

  const {
    visibleItems: visibleThreads,
    hiddenItems: hiddenThreads,
    hasHiddenItems: hasHiddenThreads,
  } = getNavigationSectionVisibleItems({
    items: recentThreads,
    visibleItemLimit,
    hasMoreItemsToLoad: inboxThreadList?.hasNextPage ?? false,
  });

  return (
    <NavigationDrawerInboxThreadSection
      sectionId={INBOX_RECENTS_NAVIGATION_SECTION_ID}
      title={t`Recent chats`}
      threads={visibleThreads}
      currentThreadId={currentThreadId}
      onThreadClick={handleThreadClick}
      headerAction={headerAction}
      footer={
        <>
          {hasHiddenThreads && (
            <NavigationMenuSectionSeeMore
              sectionId="AiChatRecents"
              hiddenItems={
                <StyledNavigationMenuSectionHiddenItems>
                  {hiddenThreads.map((thread) => (
                    <NavigationDrawerInboxThreadItem
                      key={thread.id}
                      thread={thread}
                      isActive={currentThreadId === thread.id}
                      onClick={handleThreadClick}
                    />
                  ))}
                  <InboxThreadListFetchMoreTrigger
                    source={INBOX_RECENT_THREAD_LIST_SOURCE}
                  />
                </StyledNavigationMenuSectionHiddenItems>
              }
            />
          )}
          {!hasHiddenThreads && (
            <InboxThreadListFetchMoreTrigger
              source={INBOX_RECENT_THREAD_LIST_SOURCE}
            />
          )}
        </>
      }
    />
  );
};
