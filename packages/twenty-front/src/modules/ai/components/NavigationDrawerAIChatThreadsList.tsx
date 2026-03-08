import { styled } from '@linaria/react';

import { AIChatSkeletonLoader } from '@/ai/components/internal/AIChatSkeletonLoader';
import { NavigationDrawerAIChatThreadDateSection } from '@/ai/components/NavigationDrawerAIChatThreadDateSection';
import { useAIChatThreadClick } from '@/ai/hooks/useAIChatThreadClick';
import { useChatThreads } from '@/ai/hooks/useChatThreads';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { type DateGroupKey } from '@/ai/utils/dateGroupKey';
import { DATE_GROUP_KEYS } from '@/ai/utils/dateGroupKeys';
import { getDateGroupTitle } from '@/ai/utils/getDateGroupTitle';
import { groupThreadsByDate } from '@/ai/utils/groupThreadsByDate';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledScrollableList = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[0]};
  width: calc(100% - ${themeCssVariables.spacing[2]});
`;

const StyledFetchMoreTrigger = styled.div`
  height: 1px;
  min-height: 1px;
  width: 100%;
`;

export const NavigationDrawerAIChatThreadsList = () => {
  const currentAIChatThread = useAtomStateValue(currentAIChatThreadState);
  const { handleThreadClick } = useAIChatThreadClick({
    resetNavigationStack: true,
  });

  const { threads, hasNextPage, loading, fetchMoreRef } = useChatThreads();

  const groupedThreads = groupThreadsByDate(threads);

  if (loading && threads.length === 0) {
    return <AIChatSkeletonLoader />;
  }

  return (
    <StyledScrollableList>
      {DATE_GROUP_KEYS.map((key: DateGroupKey) => {
        const threadsInGroup = groupedThreads[key];
        if (threadsInGroup.length === 0) return null;

        return (
          <NavigationDrawerAIChatThreadDateSection
            key={key}
            title={getDateGroupTitle(key)}
            threads={threadsInGroup}
            currentThreadId={currentAIChatThread}
            onThreadClick={handleThreadClick}
          />
        );
      })}
      {hasNextPage ? <StyledFetchMoreTrigger ref={fetchMoreRef} /> : null}
    </StyledScrollableList>
  );
};
