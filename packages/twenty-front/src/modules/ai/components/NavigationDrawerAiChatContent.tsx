import { useIsNavigationDrawerContentExpanded } from '@/navigation/hooks/useIsNavigationDrawerContentExpanded';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme';

import { AgentChatThreadsFetchMoreTrigger } from '@/ai/components/AgentChatThreadsFetchMoreTrigger';
import { AiChatSkeletonLoader } from '@/ai/components/internal/AiChatSkeletonLoader';
import { NavigationDrawerAiChatChannelsSection } from '@/ai/components/NavigationDrawerAiChatChannelsSection';
import { NavigationDrawerAiChatThreadSection } from '@/ai/components/NavigationDrawerAiChatThreadSection';
import { NavigationDrawerAiChatTriageSection } from '@/ai/components/NavigationDrawerAiChatTriageSection';
import { useAiChatThreadClick } from '@/ai/hooks/useAiChatThreadClick';
import { useChatThreads } from '@/ai/hooks/useChatThreads';
import { agentChatRecentThreadsSelector } from '@/ai/states/selectors/agentChatRecentThreadsSelector';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { agentChatFavoriteThreadsSelector } from '@/ai/states/selectors/agentChatFavoriteThreadsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

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

const AI_CHAT_FAVORITES_NAVIGATION_SECTION_ID = 'AiChatFavorites';

// Triage and channels open the inbox page; the drawer itself only lists favorites
export const NavigationDrawerAiChatContent = () => {
  const { t } = useLingui();
  const isExpanded = useIsNavigationDrawerContentExpanded();

  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const { handleThreadClick } = useAiChatThreadClick({
    shouldOpenInFullPage: true,
  });

  const { threads, loading } = useChatThreads(agentChatRecentThreadsSelector);
  const agentChatFavoriteThreads = useAtomStateValue(
    agentChatFavoriteThreadsSelector,
  );

  if (loading && threads.length === 0) {
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
          <NavigationDrawerAiChatTriageSection />
          <NavigationDrawerAiChatChannelsSection />
          {agentChatFavoriteThreads.length > 0 && (
            <NavigationDrawerAiChatThreadSection
              sectionId={AI_CHAT_FAVORITES_NAVIGATION_SECTION_ID}
              title={t`Favorites`}
              threads={agentChatFavoriteThreads}
              currentThreadId={currentAiChatThread}
              onThreadClick={handleThreadClick}
            />
          )}
        </StyledSectionsContainer>
        <AgentChatThreadsFetchMoreTrigger />
      </StyledThreadList>
    </StyledContainer>
  );
};
