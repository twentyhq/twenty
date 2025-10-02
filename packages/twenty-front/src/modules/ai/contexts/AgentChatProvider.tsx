import { AgentChatSessionProvider } from '@/ai/components/AgentChatSessionProvider';
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

const StyledEmptyState = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.md};
  height: 100%;
  justify-content: center;
`;

export const AgentChatProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
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

  const { loading: messagesLoading, data } = useGetAgentChatMessagesQuery({
    variables: { threadId: currentThreadId! },
    skip: !isDefined(currentThreadId),
  });

  const uiMessages = mapDBMessagesToUIMessages(data?.agentChatMessages || []);

  const isLoading = messagesLoading || threadsLoading;

  if (!agentId) {
    return <StyledEmptyState>{t`No AI Agent found.`}</StyledEmptyState>;
  }

  if (isLoading && uiMessages.length === 0) {
    return <AIChatSkeletonLoader />;
  }

  return (
    <AgentChatSessionProvider
      key={currentThreadId}
      agentId={agentId}
      uiMessages={uiMessages}
      isLoading={isLoading}
    >
      {children}
    </AgentChatSessionProvider>
  );
};
