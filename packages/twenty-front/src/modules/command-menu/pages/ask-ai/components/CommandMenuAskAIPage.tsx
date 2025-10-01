import { LazyAIChatTab } from '@/ai/components/LazyAIChatTab';
import { AIChatSkeletonLoader } from '@/ai/components/internal/AIChatSkeletonLoader';
import { currentAIChatThreadComponentState } from '@/ai/states/currentAIChatThreadComponentState';
import { mapDBMessagesToUIMessages } from '@/ai/utils/mapDBMessagesToUIMessages';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import {
  useGetAgentChatMessagesQuery,
  useGetAgentChatThreadsQuery,
} from '~/generated-metadata/graphql';

const StyledContainer = styled.div`
  height: 100%;
  width: 100%;
`;

const StyledEmptyState = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.md};
  height: 100%;
  justify-content: center;
`;

export const CommandMenuAskAIPage = () => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const agentId = currentWorkspace?.defaultAgent?.id;

  const [currentThreadId, setCurrentThreadId] = useRecoilComponentState(
    currentAIChatThreadComponentState,
    agentId,
  );

  const { loading: threadsLoading } = useGetAgentChatThreadsQuery({
    variables: { agentId: agentId! },
    skip: isDefined(currentThreadId) || !isDefined(agentId),
    onCompleted: (data) => {
      if (data.agentChatThreads.length > 0) {
        setCurrentThreadId(data.agentChatThreads[0].id);
      }
    },
  });

  const { loading, data } = useGetAgentChatMessagesQuery({
    variables: { threadId: currentThreadId ?? '' },
    skip: !isDefined(currentThreadId),
  });

  const isLoading = loading || !currentThreadId || threadsLoading;

  if (isLoading) {
    return <AIChatSkeletonLoader />;
  }

  if (!agentId) {
    return (
      <StyledContainer>
        <StyledEmptyState>{t`No AI Agent found.`}</StyledEmptyState>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <LazyAIChatTab
        agentId={agentId}
        key={currentThreadId}
        uiMessages={mapDBMessagesToUIMessages(data?.agentChatMessages || [])}
      />
    </StyledContainer>
  );
};
