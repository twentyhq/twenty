import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { useOpenAskAIPageInCommandMenu } from '@/command-menu/hooks/useOpenAskAIPageInCommandMenu';
import { useRecoilState } from 'recoil';
import { useCreateChatThreadMutation } from '~/generated-metadata/graphql';

export const useCreateNewAIChatThread = () => {
  const [, setCurrentAIChatThread] = useRecoilState(currentAIChatThreadState);

  const { openAskAIPage } = useOpenAskAIPageInCommandMenu();
  const [createAgentChatThread] = useCreateChatThreadMutation({
    onCompleted: (data) => {
      setCurrentAIChatThread(data.createChatThread.id);
      openAskAIPage();
    },
  });

  return { createAgentChatThread };
};
