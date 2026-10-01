import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { AgentChatThreadsFetchMoreTrigger } from '@/ai/components/AgentChatThreadsFetchMoreTrigger';
import { AiChatThreadFilterDropdown } from '@/ai/components/AiChatThreadFilterDropdown';
import { AiChatThreadList } from '@/ai/components/AiChatThreadList';
import { AGENT_CHAT_THREAD_FILTER_STATUS_ICONS } from '@/ai/constants/AgentChatThreadFilterStatusIcons';
import { AGENT_CHAT_THREAD_FILTER_STATUS_LABELS } from '@/ai/constants/AgentChatThreadFilterStatusLabels';
import { AGENT_CHAT_THREAD_GROUP_BY } from '@/ai/constants/AgentChatThreadGroupBy';
import { AI_CHAT_THREAD_ACTIONS_SURFACE } from '@/ai/constants/AiChatThreadActionsSurface';
import { useChatThreads } from '@/ai/hooks/useChatThreads';
import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatThreadGroupByState } from '@/ai/states/agentChatThreadGroupByState';
import { agentChatVisibleThreadsSelector } from '@/ai/states/selectors/agentChatVisibleThreadsSelector';
import { AnimatedPlaceholder } from '@/ui/feedback/empty-state/components/AnimatedPlaceholder/AnimatedPlaceholder';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledHeaderActions = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledThreadList = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: auto;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

export const AiChatInboxPage = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const agentChatThreadFilterStatus = useAtomStateValue(
    agentChatThreadFilterStatusState,
  );
  const agentChatThreadGroupBy = useAtomStateValue(agentChatThreadGroupByState);
  const { threads, loading } = useChatThreads(agentChatVisibleThreadsSelector);
  const { switchToNewChat } = useSwitchToNewAiChat();

  const StatusIcon =
    AGENT_CHAT_THREAD_FILTER_STATUS_ICONS[agentChatThreadFilterStatus];

  return (
    <PageCardLayout
      header={
        <PageCardHeader
          icon={<StatusIcon size={theme.icon.size.md} />}
          title={t(
            AGENT_CHAT_THREAD_FILTER_STATUS_LABELS[agentChatThreadFilterStatus],
          )}
          actionButton={
            <StyledHeaderActions>
              <AiChatThreadFilterDropdown
                surface={AI_CHAT_THREAD_ACTIONS_SURFACE.INBOX_PAGE}
              />
              <Button
                size="sm"
                variant="solid"
                color="accent"
                startIcon={<IconPlus />}
                onClick={switchToNewChat}
              >
                {t`New chat`}
              </Button>
            </StyledHeaderActions>
          }
        />
      }
    >
      <StyledThreadList>
        {loading && threads.length === 0 ? (
          <SkeletonLoader />
        ) : threads.length === 0 ? (
          <EmptyState.Root>
            <AnimatedPlaceholder type="emptyInbox" />
            <EmptyState.Content>
              <EmptyState.Title>{t`No conversations`}</EmptyState.Title>
              <EmptyState.Description>
                {t`Conversations you can open will appear here.`}
              </EmptyState.Description>
            </EmptyState.Content>
          </EmptyState.Root>
        ) : (
          <AiChatThreadList
            threads={threads}
            surface={AI_CHAT_THREAD_ACTIONS_SURFACE.INBOX_PAGE}
            isGroupedByDate={
              agentChatThreadGroupBy === AGENT_CHAT_THREAD_GROUP_BY.DATE
            }
          />
        )}
        <AgentChatThreadsFetchMoreTrigger />
      </StyledThreadList>
    </PageCardLayout>
  );
};
