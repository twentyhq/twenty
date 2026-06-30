import { styled } from '@linaria/react';

import { AiChatThreadDeleteConfirmationModal } from '@/ai/components/AiChatThreadDeleteConfirmationModal';
import { AiChatThreadFilterDropdown } from '@/ai/components/AiChatThreadFilterDropdown';
import { AiChatThreadGroup } from '@/ai/components/AiChatThreadGroup';
import { AiChatThreadListItem } from '@/ai/components/AiChatThreadListItem';
import { AiChatThreadsListFocusEffect } from '@/ai/components/AiChatThreadsListFocusEffect';
import { AiChatSkeletonLoader } from '@/ai/components/internal/AiChatSkeletonLoader';
import { AGENT_CHAT_THREAD_GROUP_BY } from '@/ai/constants/AgentChatThreadGroupBy';
import { AI_CHAT_THREAD_ACTIONS_SURFACE } from '@/ai/constants/AiChatThreadActionsSurface';
import { useChatThreads } from '@/ai/hooks/useChatThreads';
import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { agentChatThreadGroupByState } from '@/ai/states/agentChatThreadGroupByState';
import { groupThreadsByDate } from '@/ai/utils/groupThreadsByDate';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { Key } from 'ts-key-enum';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { getOsControlSymbol } from 'twenty-ui/utilities';

const StyledContainer = styled.div`
  background: ${themeCssVariables.background.secondary};
  border-right: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledThreadsContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledFlatThreadList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledButtonsContainer = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.medium};
  display: flex;
  justify-content: flex-end;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[2]};
`;

export const AiChatThreadsList = () => {
  const { switchToNewChat } = useSwitchToNewAiChat();

  const focusId = 'threads-list';

  useHotkeysOnFocusedElement({
    keys: [`${Key.Control}+${Key.Enter}`, `${Key.Meta}+${Key.Enter}`],
    callback: () => switchToNewChat(),
    focusId,
    dependencies: [switchToNewChat],
  });

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
      <AiChatThreadsListFocusEffect focusId={focusId} />
      <StyledContainer>
        <StyledThreadsContainer>
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
          {hasNextPage ? (
            <div ref={fetchMoreRef} style={{ minHeight: 1 }} />
          ) : null}
        </StyledThreadsContainer>
        <StyledButtonsContainer>
          <Button
            variant="primary"
            accent="blue"
            size="medium"
            title={t`New chat`}
            onClick={() => switchToNewChat()}
            hotkeys={[getOsControlSymbol(), '⏎']}
          />
        </StyledButtonsContainer>
      </StyledContainer>
      <AiChatThreadDeleteConfirmationModal
        surface={AI_CHAT_THREAD_ACTIONS_SURFACE.SIDE_PANEL}
      />
    </>
  );
};
