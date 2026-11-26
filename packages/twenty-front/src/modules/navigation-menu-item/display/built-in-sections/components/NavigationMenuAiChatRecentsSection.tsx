import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

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
import { NAVIGATION_MENU_SECTION_VISIBLE_ITEM_LIMIT } from '@/navigation-menu-item/common/constants/NavigationMenuSectionVisibleItemLimit';
import { NavigationMenuSectionSeeMore } from '@/navigation-menu-item/display/sections/components/NavigationMenuSectionSeeMore';
import { useIsNavigationDrawerContentExpanded } from '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

const StyledHiddenThreads = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.betweenSiblingsGap};
  padding-bottom: ${themeCssVariables.betweenSiblingsGap};
`;

type NavigationMenuAiChatRecentsSectionProps = {
  headerAction?: ReactNode;
};

export const NavigationMenuAiChatRecentsSection = ({
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

  const hasHiddenThreads =
    recentThreads.length > NAVIGATION_MENU_SECTION_VISIBLE_ITEM_LIMIT ||
    (inboxThreadList?.hasNextPage ?? false);

  const visibleThreads = recentThreads.slice(
    0,
    NAVIGATION_MENU_SECTION_VISIBLE_ITEM_LIMIT,
  );
  const hiddenThreads = recentThreads.slice(
    NAVIGATION_MENU_SECTION_VISIBLE_ITEM_LIMIT,
  );

  return (
    <NavigationDrawerInboxThreadSection
      sectionId={INBOX_RECENTS_NAVIGATION_SECTION_ID}
      title={t`Recent chats`}
      threads={visibleThreads}
      currentThreadId={currentThreadId}
      onThreadClick={handleThreadClick}
      headerAction={headerAction}
      footer={
        hasHiddenThreads && (
          <NavigationMenuSectionSeeMore
            sectionId="AiChatRecents"
            hiddenItems={
              <StyledHiddenThreads>
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
              </StyledHiddenThreads>
            }
          />
        )
      }
    />
  );
};
