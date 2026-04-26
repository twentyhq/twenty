import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AiChatThreadFilterDropdown } from '@/ai/components/AiChatThreadFilterDropdown';
import { AiChatSkeletonLoader } from '@/ai/components/internal/AiChatSkeletonLoader';
import { NavigationDrawerAiChatThreadDateSection } from '@/ai/components/NavigationDrawerAiChatThreadDateSection';
import { NavigationDrawerAiChatThreadItem } from '@/ai/components/NavigationDrawerAiChatThreadItem';
import { AGENT_CHAT_THREAD_GROUP_BY } from '@/ai/constants/AgentChatThreadGroupBy';
import { AI_CHAT_THREAD_ACTIONS_SURFACE } from '@/ai/constants/AiChatThreadActionsSurface';
import { useAiChatThreadClick } from '@/ai/hooks/useAiChatThreadClick';
import { useChatThreads } from '@/ai/hooks/useChatThreads';
import { agentChatThreadGroupByState } from '@/ai/states/agentChatThreadGroupByState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { type DateGroupKey } from '@/ai/utils/dateGroupKey';
import { DATE_GROUP_KEYS } from '@/ai/utils/dateGroupKeys';
import { getDateGroupTitle } from '@/ai/utils/getDateGroupTitle';
import { groupThreadsByDate } from '@/ai/utils/groupThreadsByDate';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
`;

const StyledThreadList = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[0]};
  width: calc(100% - ${themeCssVariables.spacing[2]});
`;

const StyledFlatList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['0.5']};
`;

const StyledEmptyState = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.light};
  display: flex;
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
  justify-content: center;
`;

const StyledFetchMoreTrigger = styled.div`
  height: 1px;
  min-height: 1px;
  width: 100%;
`;

export const NavigationDrawerAiChatContent = () => {
  const { t } = useLingui();

  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const { handleThreadClick } = useAiChatThreadClick({
    resetNavigationStack: true,
  });
  const agentChatThreadGroupBy = useAtomStateValue(agentChatThreadGroupByState);

  const { threads, hasNextPage, loading, fetchMoreRef } = useChatThreads();

  if (loading && threads.length === 0) {
    return (
      <StyledContainer>
        <AiChatSkeletonLoader />
      </StyledContainer>
    );
  }

  const isGroupedByDate =
    agentChatThreadGroupBy === AGENT_CHAT_THREAD_GROUP_BY.DATE;
  const groupedThreads = isGroupedByDate ? groupThreadsByDate(threads) : null;

  return (
    <StyledContainer>
      <StyledThreadList>
        <NavigationDrawerSectionTitle
          label={t`Recents`}
          alwaysShowRightIcon
          rightIcon={
            <AiChatThreadFilterDropdown
              surface={AI_CHAT_THREAD_ACTIONS_SURFACE.NAV_DRAWER}
            />
          }
        />
        {threads.length === 0 ? (
          <StyledEmptyState>{t`No chat`}</StyledEmptyState>
        ) : isGroupedByDate && groupedThreads !== null ? (
          DATE_GROUP_KEYS.map((key: DateGroupKey) => {
            const threadsInGroup = groupedThreads[key];
            if (threadsInGroup.length === 0) return null;

            return (
              <NavigationDrawerAiChatThreadDateSection
                key={key}
                title={getDateGroupTitle(key)}
                threads={threadsInGroup}
                currentThreadId={currentAiChatThread}
                onThreadClick={handleThreadClick}
              />
            );
          })
        ) : (
          <StyledFlatList>
            {threads.map((thread) => (
              <NavigationDrawerAiChatThreadItem
                key={thread.id}
                thread={thread}
                isActive={currentAiChatThread === thread.id}
                onClick={handleThreadClick}
              />
            ))}
          </StyledFlatList>
        )}
        {hasNextPage ? <StyledFetchMoreTrigger ref={fetchMoreRef} /> : null}
      </StyledThreadList>
    </StyledContainer>
  );
};
