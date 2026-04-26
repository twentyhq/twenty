import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AiChatThreadFilterDropdown } from '@/ai/components/AiChatThreadFilterDropdown';
import { AiChatSkeletonLoader } from '@/ai/components/internal/AiChatSkeletonLoader';
import { NavigationDrawerAiChatThreadSection } from '@/ai/components/NavigationDrawerAiChatThreadSection';
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

const StyledSectionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
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

const AI_CHAT_RECENTS_NAVIGATION_SECTION_ID = 'AiChatRecents';

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
  const dateGroupKeysWithThreads =
    groupedThreads === null
      ? []
      : DATE_GROUP_KEYS.filter(
          (key: DateGroupKey) => groupedThreads[key].length > 0,
        );

  const filterDropdown = (
    <AiChatThreadFilterDropdown
      surface={AI_CHAT_THREAD_ACTIONS_SURFACE.NAV_DRAWER}
    />
  );

  return (
    <StyledContainer>
      <StyledThreadList>
        {dateGroupKeysWithThreads.length > 0 ? (
          <StyledSectionsContainer>
            {dateGroupKeysWithThreads.map((key, index) => (
              <NavigationDrawerAiChatThreadSection
                key={key}
                sectionId={`AiChatDateGroup:${key}`}
                title={getDateGroupTitle(key)}
                threads={groupedThreads?.[key] ?? []}
                currentThreadId={currentAiChatThread}
                onThreadClick={handleThreadClick}
                rightIcon={index === 0 ? filterDropdown : undefined}
                alwaysShowRightIcon={index === 0}
              />
            ))}
          </StyledSectionsContainer>
        ) : (
          <NavigationDrawerAiChatThreadSection
            sectionId={AI_CHAT_RECENTS_NAVIGATION_SECTION_ID}
            title={t`Recents`}
            threads={threads}
            currentThreadId={currentAiChatThread}
            onThreadClick={handleThreadClick}
            rightIcon={filterDropdown}
            alwaysShowRightIcon
            emptyState={<StyledEmptyState>{t`No chat`}</StyledEmptyState>}
          />
        )}
        {hasNextPage ? <StyledFetchMoreTrigger ref={fetchMoreRef} /> : null}
      </StyledThreadList>
    </StyledContainer>
  );
};
