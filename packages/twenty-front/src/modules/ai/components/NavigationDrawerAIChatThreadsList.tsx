import styled from '@emotion/styled';

import { NavigationDrawerAIChatThreadDateSection } from '@/ai/components/NavigationDrawerAIChatThreadDateSection';
import { AIChatSkeletonLoader } from '@/ai/components/internal/AIChatSkeletonLoader';
import { useAIChatThreadClick } from '@/ai/hooks/useAIChatThreadClick';
import { currentAIChatThreadStateV2 } from '@/ai/states/currentAIChatThreadStateV2';
import { groupThreadsByDate } from '@/ai/utils/groupThreadsByDate';
import { type DateGroupKey } from '@/ai/utils/dateGroupKey';
import { DATE_GROUP_KEYS } from '@/ai/utils/dateGroupKeys';
import { getDateGroupTitle } from '@/ai/utils/getDateGroupTitle';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useGetChatThreadsQuery } from '~/generated-metadata/graphql';

const StyledScrollableList = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing(2, 0)};
  width: ${({ theme }) => `calc(100% - ${theme.spacing(2)})`};
`;

export const NavigationDrawerAIChatThreadsList = () => {
  const currentThreadId = useRecoilValueV2(currentAIChatThreadStateV2);
  const { handleThreadClick } = useAIChatThreadClick({
    resetNavigationStack: true,
  });

  const { data: { chatThreads = [] } = {}, loading } = useGetChatThreadsQuery();
  const groupedThreads = groupThreadsByDate(chatThreads);

  if (loading === true) {
    return <AIChatSkeletonLoader />;
  }

  return (
    <StyledScrollableList>
      {DATE_GROUP_KEYS.map((key: DateGroupKey) => {
        const threads = groupedThreads[key];
        if (threads.length === 0) return null;

        return (
          <NavigationDrawerAIChatThreadDateSection
            key={key}
            title={getDateGroupTitle(key)}
            threads={threads}
            currentThreadId={currentThreadId}
            onThreadClick={handleThreadClick}
          />
        );
      })}
    </StyledScrollableList>
  );
};
