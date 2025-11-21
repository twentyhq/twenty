import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { useOpenAskAIPageInCommandMenu } from '@/command-menu/hooks/useOpenAskAIPageInCommandMenu';
import { useRecoilState } from 'recoil';
import { useCreateChatThreadMutation } from '~/generated-metadata/graphql';

export const useCreateNewAIChatThread = () => {
  const [, setCurrentAIChatThread] = useRecoilState(currentAIChatThreadState);

  const { openAskAIPage } = useOpenAskAIPageInCommandMenu();
  const [createChatThread] = useCreateChatThreadMutation({
    onCompleted: (data) => {
      setCurrentAIChatThread(data.createChatThread.id);
      openAskAIPage({ resetNavigationStack: false });
    },
  });

  return { createChatThread };
};
