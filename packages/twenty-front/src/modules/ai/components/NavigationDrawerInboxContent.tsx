import { useIsNavigationDrawerContentExpanded } from '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { AgentChatThreadConversationType } from 'twenty-shared/ai';
import { themeCssVariables } from 'twenty-ui/theme';

import { InboxThreadListFetchMoreTrigger } from '@/ai/components/InboxThreadListFetchMoreTrigger';
import { InboxSkeletonLoader } from '@/ai/components/internal/InboxSkeletonLoader';
import { NavigationDrawerInboxChannelsSection } from '@/ai/components/NavigationDrawerInboxChannelsSection';
import { NavigationDrawerInboxFavoritesSection } from '@/ai/components/NavigationDrawerInboxFavoritesSection';
import { NavigationDrawerInboxThreadSection } from '@/ai/components/NavigationDrawerInboxThreadSection';
import { NavigationDrawerInboxTriageSection } from '@/ai/components/NavigationDrawerInboxTriageSection';
import { NavigationDrawerDirectMessagesSection } from '@/ai/components/NavigationDrawerDirectMessagesSection';
import { OpenDirectMessageButton } from '@/ai/components/OpenDirectMessageButton';
import { INBOX_RECENT_THREADS_MAX_COUNT } from '@/ai/constants/InboxRecentThreadsMaxCount';
import { useInboxThreadClick } from '@/ai/hooks/useInboxThreadClick';
import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/ai/constants/InboxRecentThreadListSource';
import { useInboxThreadList } from '@/ai/hooks/useInboxThreadList';
import { inboxDirectMessageSidebarItemsSelector } from '@/ai/states/selectors/inboxDirectMessageSidebarItemsSelector';
import { currentInboxThreadState } from '@/ai/states/currentInboxThreadState';
import { inboxFavoriteChannelsSelector } from '@/ai/states/selectors/inboxFavoriteChannelsSelector';
import { inboxFavoriteThreadsSelector } from '@/ai/states/selectors/inboxFavoriteThreadsSelector';
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

  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const isDirectMessageEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AGENT_CHAT_DIRECT_MESSAGE_IDENTITY_ENABLED,
  );
  const isDirectMessagesSectionShown =
    isAiChatInboxEnabled && isDirectMessageEnabled;
  const currentInboxThread = useAtomStateValue(currentInboxThreadState);
  const { handleThreadClick } = useInboxThreadClick(
    isAiChatInboxEnabled
      ? { shouldOpenInFullPage: true }
      : { resetNavigationStack: true },
  );

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
      <StyledContainer>{isExpanded && <InboxSkeletonLoader />}</StyledContainer>
    );
  }

  const inboxFavoriteThreadIds = new Set(
    inboxFavoriteThreads.map(({ id }) => id),
  );
  const threadsOutsideOtherSections = threads.filter(
    ({ id, conversationType }) =>
      !inboxFavoriteThreadIds.has(id) &&
      !(
        isDirectMessagesSectionShown &&
        conversationType === AgentChatThreadConversationType.DIRECT_MESSAGE
      ),
  );
  const recentThreads = isAiChatInboxEnabled
    ? threadsOutsideOtherSections.slice(0, INBOX_RECENT_THREADS_MAX_COUNT)
    : threadsOutsideOtherSections;

  return (
    <StyledContainer>
      <StyledThreadList>
        <StyledSectionsContainer>
          {isAiChatInboxEnabled && <NavigationDrawerInboxTriageSection />}
          <NavigationDrawerInboxFavoritesSection
            channels={isAiChatInboxEnabled ? inboxFavoriteChannels : []}
            threads={inboxFavoriteThreads}
            currentThreadId={currentInboxThread}
            onThreadClick={handleThreadClick}
          />
          {isAiChatInboxEnabled && <NavigationDrawerInboxChannelsSection />}
          {isDirectMessagesSectionShown && (
            <NavigationDrawerDirectMessagesSection
              directMessages={inboxDirectMessageSidebarItems}
              currentThreadId={currentInboxThread}
              onSelect={(threadId) => handleThreadClick({ id: threadId })}
              memberPicker={<OpenDirectMessageButton />}
            />
          )}
          {recentThreads.length > 0 && (
            <NavigationDrawerInboxThreadSection
              sectionId={INBOX_RECENTS_NAVIGATION_SECTION_ID}
              title={t`Recent`}
              threads={recentThreads}
              currentThreadId={currentInboxThread}
              onThreadClick={handleThreadClick}
            />
          )}
        </StyledSectionsContainer>
        {!isAiChatInboxEnabled && (
          <InboxThreadListFetchMoreTrigger
            source={INBOX_RECENT_THREAD_LIST_SOURCE}
          />
        )}
      </StyledThreadList>
    </StyledContainer>
  );
};
