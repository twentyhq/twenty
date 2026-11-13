import { useIsNavigationDrawerContentExpanded } from '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { AgentChatThreadConversationType } from 'twenty-shared/ai';
import { themeCssVariables } from 'twenty-ui/theme';

import { InboxThreadListFetchMoreTrigger } from '@/ai/components/AgentChatThreadListFetchMoreTrigger';
import { AiChatSkeletonLoader } from '@/ai/components/internal/AiChatSkeletonLoader';
import { NavigationDrawerInboxChannelsSection } from '@/ai/components/NavigationDrawerAiChatChannelsSection';
import { NavigationDrawerInboxFavoritesSection } from '@/ai/components/NavigationDrawerAiChatFavoritesSection';
import { NavigationDrawerAiChatThreadSection } from '@/ai/components/NavigationDrawerAiChatThreadSection';
import { NavigationDrawerInboxTriageSection } from '@/ai/components/NavigationDrawerAiChatTriageSection';
import { NavigationDrawerDirectMessagesSection } from '@/ai/components/NavigationDrawerDirectMessagesSection';
import { OpenDirectMessageButton } from '@/ai/components/OpenDirectMessageButton';
import { INBOX_RECENT_THREADS_MAX_COUNT } from '@/ai/constants/AiChatInboxRecentThreadsMaxCount';
import { useAiChatThreadClick } from '@/ai/hooks/useAiChatThreadClick';
import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/ai/constants/AgentChatRecentThreadListSource';
import { useInboxThreadList } from '@/ai/hooks/useAgentChatThreadList';
import { inboxDirectMessageSidebarItemsSelector } from '@/ai/states/selectors/agentChatDirectMessageSidebarItemsSelector';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { inboxFavoriteChannelsSelector } from '@/ai/states/selectors/agentChatFavoriteChannelsSelector';
import { inboxFavoriteThreadsSelector } from '@/ai/states/selectors/agentChatFavoriteThreadsSelector';
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

const AI_CHAT_RECENTS_NAVIGATION_SECTION_ID = 'AiChatRecents';

export const NavigationDrawerAiChatContent = () => {
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
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const { handleThreadClick } = useAiChatThreadClick(
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
      <StyledContainer>
        {isExpanded && <AiChatSkeletonLoader />}
      </StyledContainer>
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
            currentThreadId={currentAiChatThread}
            onThreadClick={handleThreadClick}
          />
          {isAiChatInboxEnabled && <NavigationDrawerInboxChannelsSection />}
          {isDirectMessagesSectionShown && (
            <NavigationDrawerDirectMessagesSection
              directMessages={inboxDirectMessageSidebarItems}
              currentThreadId={currentAiChatThread}
              onSelect={(threadId) => handleThreadClick({ id: threadId })}
              memberPicker={<OpenDirectMessageButton />}
            />
          )}
          {recentThreads.length > 0 && (
            <NavigationDrawerAiChatThreadSection
              sectionId={AI_CHAT_RECENTS_NAVIGATION_SECTION_ID}
              title={t`Recent`}
              threads={recentThreads}
              currentThreadId={currentAiChatThread}
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
