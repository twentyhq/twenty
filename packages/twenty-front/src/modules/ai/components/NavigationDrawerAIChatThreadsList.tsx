import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';

import { NavigationDrawerAIChatThreadDateSection } from '@/ai/components/NavigationDrawerAIChatThreadDateSection';
import { AIChatSkeletonLoader } from '@/ai/components/internal/AIChatSkeletonLoader';
import { useAIChatThreadClick } from '@/ai/hooks/useAIChatThreadClick';
import { currentAIChatThreadStateV2 } from '@/ai/states/currentAIChatThreadStateV2';
import { groupThreadsByDate } from '@/ai/utils/groupThreadsByDate';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useGetChatThreadsQuery } from '~/generated-metadata/graphql';

const DATE_GROUP_KEYS = ['today', 'yesterday', 'older'] as const;

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
  const { t } = useLingui();
  const currentThreadId = useRecoilValueV2(currentAIChatThreadStateV2);
  const { handleThreadClick } = useAIChatThreadClick({
    resetNavigationStack: true,
  });

  const { data: { chatThreads = [] } = {}, loading } = useGetChatThreadsQuery();
  const groupedThreads = groupThreadsByDate(chatThreads);

  const getDateGroupTitle = (key: (typeof DATE_GROUP_KEYS)[number]): string => {
    switch (key) {
      case 'today':
        return t`Today`;
      case 'yesterday':
        return t`Yesterday`;
      case 'older':
        return t`Older`;
    }
  };

  if (loading === true) {
    return <AIChatSkeletonLoader />;
  }

  return (
    <StyledScrollableList>
      {DATE_GROUP_KEYS.map((key) => {
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
