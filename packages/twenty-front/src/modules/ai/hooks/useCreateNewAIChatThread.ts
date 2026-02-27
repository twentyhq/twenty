import { agentChatUsageState } from '@/ai/states/agentChatUsageState';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { currentAIChatThreadTitleState } from '@/ai/states/currentAIChatThreadTitleState';
import { useOpenAskAIPageInCommandMenu } from '@/command-menu/hooks/useOpenAskAIPageInCommandMenu';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useCreateChatThreadMutation } from '~/generated-metadata/graphql';

export const useCreateNewAIChatThread = () => {
  const [, setCurrentAIChatThread] = useAtomState(currentAIChatThreadState);
  const setAgentChatUsage = useSetAtomState(agentChatUsageState);
  const setCurrentAIChatThreadTitle = useSetAtomState(
    currentAIChatThreadTitleState,
  );

  const { openAskAIPage } = useOpenAskAIPageInCommandMenu();
  const [createChatThread] = useCreateChatThreadMutation({
    onCompleted: (data) => {
      setCurrentAIChatThread(data.createChatThread.id);
      setCurrentAIChatThreadTitle(null);
      setAgentChatUsage(null);
      openAskAIPage({ resetNavigationStack: false });
    },
  });

  return { createChatThread };
};
