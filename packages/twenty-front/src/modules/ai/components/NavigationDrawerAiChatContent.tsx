import { useIsNavigationDrawerContentExpanded } from '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme';

import { AgentChatThreadsFetchMoreTrigger } from '@/ai/components/AgentChatThreadsFetchMoreTrigger';
import { AiChatSkeletonLoader } from '@/ai/components/internal/AiChatSkeletonLoader';
import { NavigationDrawerAiChatChannelsSection } from '@/ai/components/NavigationDrawerAiChatChannelsSection';
import { NavigationDrawerAiChatFavoritesSection } from '@/ai/components/NavigationDrawerAiChatFavoritesSection';
import { NavigationDrawerAiChatThreadSection } from '@/ai/components/NavigationDrawerAiChatThreadSection';
import { NavigationDrawerAiChatTriageSection } from '@/ai/components/NavigationDrawerAiChatTriageSection';
import { AI_CHAT_RECENTS_NAVIGATION_SECTION_ID } from '@/ai/constants/AiChatRecentsNavigationSectionId';
import { useAiChatSidebarThreads } from '@/ai/hooks/useAiChatSidebarThreads';

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

export const NavigationDrawerAiChatContent = () => {
  const { t } = useLingui();
  const isExpanded = useIsNavigationDrawerContentExpanded();
  const {
    isAiChatInboxEnabled,
    isLoading,
    favoriteChannels,
    favoriteThreads,
    recentThreads,
    currentAiChatThread,
    handleThreadClick,
  } = useAiChatSidebarThreads();

  if (isLoading) {
    return (
      <StyledContainer>
        {isExpanded && <AiChatSkeletonLoader />}
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <StyledThreadList>
        <StyledSectionsContainer>
          {isAiChatInboxEnabled && <NavigationDrawerAiChatTriageSection />}
          <NavigationDrawerAiChatFavoritesSection
            channels={favoriteChannels}
            threads={favoriteThreads}
            currentThreadId={currentAiChatThread}
            onThreadClick={handleThreadClick}
          />
          {isAiChatInboxEnabled && <NavigationDrawerAiChatChannelsSection />}
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
        {!isAiChatInboxEnabled && <AgentChatThreadsFetchMoreTrigger />}
      </StyledThreadList>
    </StyledContainer>
  );
};
