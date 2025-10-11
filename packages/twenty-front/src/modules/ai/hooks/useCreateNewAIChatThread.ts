import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { useOpenAskAIPageInCommandMenu } from '@/command-menu/hooks/useOpenAskAIPageInCommandMenu';
import { useRecoilState } from 'recoil';
import { useCreateAgentChatThreadMutation } from '~/generated-metadata/graphql';

export const useCreateNewAIChatThread = ({ agentId }: { agentId: string }) => {
  const [, setCurrentAIChatThread] = useRecoilState(currentAIChatThreadState);

  const { openAskAIPage } = useOpenAskAIPageInCommandMenu();
  const [createAgentChatThread] = useCreateAgentChatThreadMutation({
    variables: { input: { agentId } },
    onCompleted: (data) => {
      setCurrentAIChatThread(data.createAgentChatThread.id);
      openAskAIPage();
    },
  });

  return { createAgentChatThread };
};
