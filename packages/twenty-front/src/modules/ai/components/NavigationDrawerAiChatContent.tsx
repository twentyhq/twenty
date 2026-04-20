import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AiChatSkeletonLoader } from '@/ai/components/internal/AiChatSkeletonLoader';
import { NavigationDrawerAiChatThreadDateSection } from '@/ai/components/NavigationDrawerAiChatThreadDateSection';
import { useAiChatThreadClick } from '@/ai/hooks/useAiChatThreadClick';
import { useChatThreads } from '@/ai/hooks/useChatThreads';
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

  const { threads, hasNextPage, loading, fetchMoreRef } = useChatThreads();

  const groupedThreads = groupThreadsByDate(threads);

  if (loading && threads.length === 0) {
    return (
      <StyledContainer>
        <AiChatSkeletonLoader />
      </StyledContainer>
    );
  }

  if (threads.length === 0) {
    return (
      <StyledContainer>
        <StyledEmptyState>{t`No chat`}</StyledEmptyState>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <StyledThreadList>
        {DATE_GROUP_KEYS.map((key: DateGroupKey) => {
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
        })}
        {hasNextPage ? <StyledFetchMoreTrigger ref={fetchMoreRef} /> : null}
      </StyledThreadList>
    </StyledContainer>
  );
};
