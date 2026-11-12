import { useIsNavigationDrawerContentExpanded } from '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { AgentChatThreadConversationType } from 'twenty-shared/ai';
import { themeCssVariables } from 'twenty-ui/theme';

import { AgentChatThreadListFetchMoreTrigger } from '@/ai/components/AgentChatThreadListFetchMoreTrigger';
import { AiChatSkeletonLoader } from '@/ai/components/internal/AiChatSkeletonLoader';
import { NavigationDrawerAiChatChannelsSection } from '@/ai/components/NavigationDrawerAiChatChannelsSection';
import { NavigationDrawerAiChatFavoritesSection } from '@/ai/components/NavigationDrawerAiChatFavoritesSection';
import { NavigationDrawerAiChatThreadSection } from '@/ai/components/NavigationDrawerAiChatThreadSection';
import { NavigationDrawerAiChatTriageSection } from '@/ai/components/NavigationDrawerAiChatTriageSection';
import { NavigationDrawerDirectMessagesSection } from '@/ai/components/NavigationDrawerDirectMessagesSection';
import { OpenDirectMessageButton } from '@/ai/components/OpenDirectMessageButton';
import { AI_CHAT_INBOX_RECENT_THREADS_MAX_COUNT } from '@/ai/constants/AiChatInboxRecentThreadsMaxCount';
import { useAiChatThreadClick } from '@/ai/hooks/useAiChatThreadClick';
import { AGENT_CHAT_RECENT_THREAD_LIST_SOURCE } from '@/ai/constants/AgentChatRecentThreadListSource';
import { useAgentChatThreadList } from '@/ai/hooks/useAgentChatThreadList';
import { agentChatDirectMessageSidebarItemsSelector } from '@/ai/states/selectors/agentChatDirectMessageSidebarItemsSelector';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { agentChatFavoriteChannelsSelector } from '@/ai/states/selectors/agentChatFavoriteChannelsSelector';
import { agentChatFavoriteThreadsSelector } from '@/ai/states/selectors/agentChatFavoriteThreadsSelector';
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

  const { threads, isLoading } = useAgentChatThreadList(
    AGENT_CHAT_RECENT_THREAD_LIST_SOURCE,
  );
  const agentChatFavoriteThreads = useAtomStateValue(
    agentChatFavoriteThreadsSelector,
  );
  const agentChatFavoriteChannels = useAtomStateValue(
    agentChatFavoriteChannelsSelector,
  );
  const agentChatDirectMessageSidebarItems = useAtomStateValue(
    agentChatDirectMessageSidebarItemsSelector,
  );

  if (isLoading && threads.length === 0) {
    return (
      <StyledContainer>
        {isExpanded && <AiChatSkeletonLoader />}
      </StyledContainer>
    );
  }

  const agentChatFavoriteThreadIds = new Set(
    agentChatFavoriteThreads.map(({ id }) => id),
  );
  const threadsOutsideOtherSections = threads.filter(
    ({ id, conversationType }) =>
      !agentChatFavoriteThreadIds.has(id) &&
      !(
        isDirectMessagesSectionShown &&
        conversationType === AgentChatThreadConversationType.DIRECT_MESSAGE
      ),
  );
  const recentThreads = isAiChatInboxEnabled
    ? threadsOutsideOtherSections.slice(
        0,
        AI_CHAT_INBOX_RECENT_THREADS_MAX_COUNT,
      )
    : threadsOutsideOtherSections;

  return (
    <StyledContainer>
      <StyledThreadList>
        <StyledSectionsContainer>
          {isAiChatInboxEnabled && <NavigationDrawerAiChatTriageSection />}
          <NavigationDrawerAiChatFavoritesSection
            channels={isAiChatInboxEnabled ? agentChatFavoriteChannels : []}
            threads={agentChatFavoriteThreads}
            currentThreadId={currentAiChatThread}
            onThreadClick={handleThreadClick}
          />
          {isAiChatInboxEnabled && <NavigationDrawerAiChatChannelsSection />}
          {isDirectMessagesSectionShown && (
            <NavigationDrawerDirectMessagesSection
              directMessages={agentChatDirectMessageSidebarItems}
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
          <AgentChatThreadListFetchMoreTrigger
            source={AGENT_CHAT_RECENT_THREAD_LIST_SOURCE}
          />
        )}
      </StyledThreadList>
    </StyledContainer>
  );
};
