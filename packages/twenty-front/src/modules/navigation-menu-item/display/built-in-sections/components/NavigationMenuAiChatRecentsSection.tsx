import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronDown, IconChevronUp } from 'twenty-ui/icon';

import { useAiChatPageThreadId } from '@/ai-chat/hooks/useAiChatPageThreadId';
import { useAiChatThreadClick } from '@/ai-chat/threads/hooks/useAiChatThreadClick';
import { InboxThreadListFetchMoreTrigger } from '@/inbox/components/InboxThreadListFetchMoreTrigger';
import { NavigationDrawerInboxThreadSection } from '@/inbox/components/NavigationDrawerInboxThreadSection';
import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/inbox/constants/InboxRecentThreadListSource';
import { useInboxThreadList } from '@/inbox/hooks/useInboxThreadList';
import { inboxFavoriteThreadsSelector } from '@/inbox/states/selectors/inboxFavoriteThreadsSelector';
import { filterInboxRecentThreads } from '@/inbox/utils/filterInboxRecentThreads';
import { NAVIGATION_MENU_SECTION_VISIBLE_ITEM_LIMIT } from '@/navigation-menu-item/common/constants/NavigationMenuSectionVisibleItemLimit';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

type NavigationMenuAiChatRecentsSectionProps = {
  sectionId: string;
  headerAction?: ReactNode;
};

export const NavigationMenuAiChatRecentsSection = ({
  sectionId,
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
  const inboxFavoriteThreads = useAtomStateValue(inboxFavoriteThreadsSelector);
  const recentThreads = filterInboxRecentThreads({
    threads,
    favoriteThreads: inboxFavoriteThreads,
    isDirectMessageEnabled,
  });

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
      sectionId={`navigation-menu-section-${sectionId}`}
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
