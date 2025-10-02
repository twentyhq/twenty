import { AgentChatSessionProvider } from '@/ai/components/AgentChatSessionProvider';
import { currentAIChatThreadComponentState } from '@/ai/states/currentAIChatThreadComponentState';
import { mapDBMessagesToUIMessages } from '@/ai/utils/mapDBMessagesToUIMessages';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import {
  useGetAgentChatMessagesQuery,
  useGetAgentChatThreadsQuery,
} from '~/generated-metadata/graphql';

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

  return (
    <AgentChatSessionProvider
      agentId={agentId!}
      uiMessages={uiMessages}
      isLoading={isLoading}
    >
      {children}
    </AgentChatSessionProvider>
  );
};
