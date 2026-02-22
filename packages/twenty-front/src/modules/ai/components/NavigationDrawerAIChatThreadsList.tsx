import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { IconComment } from 'twenty-ui/display';

import { AIChatSkeletonLoader } from '@/ai/components/internal/AIChatSkeletonLoader';
import { useAIChatThreadClick } from '@/ai/hooks/useAIChatThreadClick';
import { currentAIChatThreadStateV2 } from '@/ai/states/currentAIChatThreadStateV2';
import { groupThreadsByDate } from '@/ai/utils/groupThreadsByDate';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import {
  type AgentChatThread,
  useGetChatThreadsQuery,
} from '~/generated-metadata/graphql';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

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

const StyledDateSection = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledThreadList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledDateHeader = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(0, 2)};
`;

const StyledThreadTimestamp = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  padding-right: ${({ theme }) => theme.spacing(0.5)};
`;

export const NavigationDrawerAIChatThreadsList = () => {
  const { t } = useLingui();
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
      {DATE_GROUP_KEYS.map((key) => {
        const threads = groupedThreads[key];
        if (threads.length === 0) return null;

        const title =
          key === 'today'
            ? t`Today`
            : key === 'yesterday'
              ? t`Yesterday`
              : t`Older`;

        return (
          <StyledDateSection key={key}>
            <StyledDateHeader>{title}</StyledDateHeader>
            <StyledThreadList>
              {threads.map((thread: AgentChatThread) => {
                const isActive = currentThreadId === thread.id;
                const timestamp = beautifyPastDateRelativeToNow(
                  thread.updatedAt ?? thread.createdAt,
                );
                return (
                  <NavigationDrawerItem
                    key={thread.id}
                    label={thread.title || t`Untitled`}
                    Icon={IconComment}
                    active={isActive}
                    onClick={() => handleThreadClick(thread)}
                    alwaysShowRightOptions
                    rightOptions={
                      <StyledThreadTimestamp
                        onClick={(event) => {
                          event.stopPropagation();
                          handleThreadClick(thread);
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            event.stopPropagation();
                            handleThreadClick(thread);
                          }
                        }}
                      >
                        {timestamp}
                      </StyledThreadTimestamp>
                    }
                  />
                );
              })}
            </StyledThreadList>
          </StyledDateSection>
        );
      })}
    </StyledScrollableList>
  );
};
