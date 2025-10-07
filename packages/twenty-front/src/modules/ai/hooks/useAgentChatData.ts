import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { mapDBMessagesToUIMessages } from '@/ai/utils/mapDBMessagesToUIMessages';
import { useRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import {
  useGetAgentChatMessagesQuery,
  useGetAgentChatThreadsQuery,
} from '~/generated-metadata/graphql';

export const useAgentChatData = (agentId: string) => {
  const [currentAIChatThread, setCurrentAIChatThread] = useRecoilState(
    currentAIChatThreadState,
  );

  const { loading: threadsLoading } = useGetAgentChatThreadsQuery({
    variables: { agentId },
    skip: isDefined(currentAIChatThread) || !isDefined(agentId),
    onCompleted: (data) => {
      if (data.agentChatThreads.length > 0) {
        setCurrentAIChatThread(data.agentChatThreads[0].id);
      }
    },
  });

  const { loading: messagesLoading, data } = useGetAgentChatMessagesQuery({
    variables: { threadId: currentAIChatThread! },
    skip: !isDefined(currentAIChatThread),
  });

  const uiMessages = mapDBMessagesToUIMessages(data?.agentChatMessages || []);
  const isLoading = messagesLoading || threadsLoading;

  return {
    uiMessages,
    isLoading,
  };
};
