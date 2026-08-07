import { styled } from '@linaria/react';

import { AiChatThreadFilterDropdown } from '@/ai/components/AiChatThreadFilterDropdown';
import { AiChatThreadGroup } from '@/ai/components/AiChatThreadGroup';
import { AiChatThreadListItem } from '@/ai/components/AiChatThreadListItem';
import { AiChatSkeletonLoader } from '@/ai/components/internal/AiChatSkeletonLoader';
import { AGENT_CHAT_THREAD_GROUP_BY } from '@/ai/constants/AgentChatThreadGroupBy';
import { AI_CHAT_THREAD_ACTIONS_SURFACE } from '@/ai/constants/AiChatThreadActionsSurface';
import { useChatThreads } from '@/ai/hooks/useChatThreads';
import { agentChatThreadGroupByState } from '@/ai/states/agentChatThreadGroupByState';
import { groupThreadsByDate } from '@/ai/utils/groupThreadsByDate';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledFlatThreadList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

export const AiChatThreadsListFallback = () => {
  const { threads, hasNextPage, loading, fetchMoreRef } = useChatThreads();
  const agentChatThreadGroupBy = useAtomStateValue(agentChatThreadGroupByState);

  if (loading && threads.length === 0) {
    return <AiChatSkeletonLoader />;
  }

  const isGroupedByDate =
    agentChatThreadGroupBy === AGENT_CHAT_THREAD_GROUP_BY.DATE;
  const dateGroups = isGroupedByDate ? groupThreadsByDate(threads) : [];
  const shouldRenderDateGroups = isGroupedByDate && dateGroups.length > 0;
  const filterDropdown = (
    <AiChatThreadFilterDropdown
      surface={AI_CHAT_THREAD_ACTIONS_SURFACE.SIDE_PANEL}
    />
  );

  return (
    <>
      {shouldRenderDateGroups ? (
        dateGroups.map((dateGroup, index) => (
          <AiChatThreadGroup
            key={dateGroup.id}
            title={dateGroup.title}
            threads={dateGroup.threads}
            rightIcon={index === 0 ? filterDropdown : undefined}
            alwaysShowRightIcon={index === 0}
          />
        ))
      ) : (
        <>
          <NavigationDrawerSectionTitle
            label={t`Recents`}
            alwaysShowRightIcon
            rightIcon={filterDropdown}
          />
          <StyledFlatThreadList>
            {threads.map((thread) => (
              <AiChatThreadListItem key={thread.id} thread={thread} />
            ))}
          </StyledFlatThreadList>
        </>
      )}
      {hasNextPage ? <div ref={fetchMoreRef} style={{ minHeight: 1 }} /> : null}
    </>
  );
};
