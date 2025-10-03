import { LazyAgentChatSessionProvider } from '@/ai/components/LazyAgentChatSessionProvider';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { mapDBMessagesToUIMessages } from '@/ai/utils/mapDBMessagesToUIMessages';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { useRecoilState, useRecoilValue } from 'recoil';
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
  const commandMenuPage = useRecoilValue(commandMenuPageState);
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const agentId = currentWorkspace?.defaultAgent?.id;

  const [currentAIChatThread, setCurrentAIChatThread] = useRecoilState(
    currentAIChatThreadState,
  );

  const isAskAIPage = commandMenuPage === CommandMenuPages.AskAI;

  const { loading: threadsLoading } = useGetAgentChatThreadsQuery({
    variables: { agentId: agentId! },
    skip: isDefined(currentAIChatThread) || !isDefined(agentId) || !isAskAIPage,
    onCompleted: (data) => {
      if (data.agentChatThreads.length > 0) {
        setCurrentAIChatThread(data.agentChatThreads[0].id);
      }
    },
  });

  const { loading: messagesLoading, data } = useGetAgentChatMessagesQuery({
    variables: { threadId: currentAIChatThread! },
    skip: !isDefined(currentAIChatThread) || !isAskAIPage,
  });

  const uiMessages = mapDBMessagesToUIMessages(data?.agentChatMessages || []);

  const isLoading = messagesLoading || threadsLoading;

  return (
    <LazyAgentChatSessionProvider
      agentId={agentId!}
      uiMessages={uiMessages}
      isLoading={isLoading}
    >
      {children}
    </LazyAgentChatSessionProvider>
  );
};
