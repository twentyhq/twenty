import { agentChatUsageState } from '@/ai/states/agentChatUsageState';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { useOpenAskAIPageInCommandMenu } from '@/command-menu/hooks/useOpenAskAIPageInCommandMenu';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { useCreateChatThreadMutation } from '~/generated-metadata/graphql';

export const useCreateNewAIChatThread = () => {
  const [, setCurrentAIChatThread] = useRecoilState(currentAIChatThreadState);
  const setAgentChatUsage = useSetRecoilState(agentChatUsageState);

  const { openAskAIPage } = useOpenAskAIPageInCommandMenu();
  const [createChatThread] = useCreateChatThreadMutation({
    onCompleted: (data) => {
      setCurrentAIChatThread(data.createChatThread.id);
      setAgentChatUsage(null);
      openAskAIPage({ resetNavigationStack: false });
    },
  });

  return { createChatThread };
};
