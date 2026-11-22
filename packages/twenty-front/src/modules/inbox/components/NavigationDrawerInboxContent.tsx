import { useIsNavigationDrawerContentExpanded } from '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatSkeletonLoader } from '@/ai-chat/components/AiChatSkeletonLoader';
import { NavigationDrawerInboxChannelsSection } from '@/inbox/components/NavigationDrawerInboxChannelsSection';
import { NavigationDrawerInboxFavoritesSection } from '@/inbox/components/NavigationDrawerInboxFavoritesSection';
import { NavigationDrawerInboxThreadSection } from '@/inbox/components/NavigationDrawerInboxThreadSection';
import { NavigationDrawerInboxTriageSection } from '@/inbox/components/NavigationDrawerInboxTriageSection';
import { NavigationDrawerInboxDirectMessagesSection } from '@/inbox/components/NavigationDrawerInboxDirectMessagesSection';
import { InboxOpenDirectMessageButton } from '@/inbox/components/InboxOpenDirectMessageButton';
import { INBOX_RECENT_THREADS_MAX_COUNT } from '@/inbox/constants/InboxRecentThreadsMaxCount';
import { useAiChatThreadClick } from '@/ai-chat/threads/hooks/useAiChatThreadClick';
import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/inbox/constants/InboxRecentThreadListSource';
import { useInboxThreadList } from '@/inbox/hooks/useInboxThreadList';
import { inboxDirectMessageSidebarItemsSelector } from '@/inbox/states/selectors/inboxDirectMessageSidebarItemsSelector';
import { useAiChatPageThreadId } from '@/ai-chat/hooks/useAiChatPageThreadId';
import { inboxFavoriteChannelsSelector } from '@/inbox/states/selectors/inboxFavoriteChannelsSelector';
import { inboxFavoriteThreadsSelector } from '@/inbox/states/selectors/inboxFavoriteThreadsSelector';
import { filterInboxRecentThreads } from '@/inbox/utils/filterInboxRecentThreads';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
`;

const StyledThreadList = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  width: 100%;
`;

const StyledSectionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const INBOX_RECENTS_NAVIGATION_SECTION_ID = 'AiChatRecents';

export const NavigationDrawerInboxContent = () => {
  const { t } = useLingui();
  const isExpanded = useIsNavigationDrawerContentExpanded();

  const isDirectMessageEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AGENT_CHAT_DIRECT_MESSAGE_IDENTITY_ENABLED,
  );
  const aiChatPageThreadId = useAiChatPageThreadId();
  const { handleThreadClick } = useAiChatThreadClick({
    shouldOpenInFullPage: true,
  });

  const { threads, isLoading } = useInboxThreadList(
    INBOX_RECENT_THREAD_LIST_SOURCE,
  );
  const inboxFavoriteThreads = useAtomStateValue(inboxFavoriteThreadsSelector);
  const inboxFavoriteChannels = useAtomStateValue(
    inboxFavoriteChannelsSelector,
  );
  const inboxDirectMessageSidebarItems = useAtomStateValue(
    inboxDirectMessageSidebarItemsSelector,
  );

  if (isLoading && threads.length === 0) {
    return (
      <StyledContainer>
        {isExpanded && <AiChatSkeletonLoader />}
      </StyledContainer>
    );
  }

  const recentThreads = filterInboxRecentThreads({
    threads,
    favoriteThreads: inboxFavoriteThreads,
    isDirectMessageEnabled,
  }).slice(0, INBOX_RECENT_THREADS_MAX_COUNT);

  return (
    <StyledContainer>
      <StyledThreadList>
        <StyledSectionsContainer>
          <NavigationDrawerInboxTriageSection />
          <NavigationDrawerInboxFavoritesSection
            channels={inboxFavoriteChannels}
            threads={inboxFavoriteThreads}
            currentThreadId={aiChatPageThreadId}
            onThreadClick={handleThreadClick}
          />
          <NavigationDrawerInboxChannelsSection />
          {isDirectMessageEnabled && (
            <NavigationDrawerInboxDirectMessagesSection
              directMessages={inboxDirectMessageSidebarItems}
              currentThreadId={aiChatPageThreadId}
              onSelect={(threadId) => handleThreadClick({ id: threadId })}
              memberPicker={<InboxOpenDirectMessageButton />}
            />
          )}
          {recentThreads.length > 0 && (
            <NavigationDrawerInboxThreadSection
              sectionId={INBOX_RECENTS_NAVIGATION_SECTION_ID}
              title={t`Recent`}
              threads={recentThreads}
              currentThreadId={aiChatPageThreadId}
              onThreadClick={handleThreadClick}
            />
          )}
        </StyledSectionsContainer>
      </StyledThreadList>
    </StyledContainer>
  );
};
