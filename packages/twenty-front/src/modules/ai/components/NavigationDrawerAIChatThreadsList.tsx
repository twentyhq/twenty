import { styled } from '@linaria/react';

import { NavigationDrawerAIChatThreadDateSection } from '@/ai/components/NavigationDrawerAIChatThreadDateSection';
import { AIChatSkeletonLoader } from '@/ai/components/internal/AIChatSkeletonLoader';
import { useAIChatThreadClick } from '@/ai/hooks/useAIChatThreadClick';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { groupThreadsByDate } from '@/ai/utils/groupThreadsByDate';
import { type DateGroupKey } from '@/ai/utils/dateGroupKey';
import { DATE_GROUP_KEYS } from '@/ai/utils/dateGroupKeys';
import { getDateGroupTitle } from '@/ai/utils/getDateGroupTitle';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useGetChatThreadsQuery } from '~/generated-metadata/graphql';

const StyledScrollableList = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[0]};
  width: calc(100% - ${themeCssVariables.spacing[2]});
`;

export const NavigationDrawerAIChatThreadsList = () => {
  const currentAIChatThread = useAtomStateValue(currentAIChatThreadState);
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
            currentThreadId={currentAIChatThread}
            onThreadClick={handleThreadClick}
          />
        );
      })}
    </StyledScrollableList>
  );
};
