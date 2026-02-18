import { agentChatUsageStateV2 } from '@/ai/states/agentChatUsageStateV2';
import { currentAIChatThreadStateV2 } from '@/ai/states/currentAIChatThreadStateV2';
import { currentAIChatThreadTitleStateV2 } from '@/ai/states/currentAIChatThreadTitleStateV2';
import { useOpenAskAIPageInCommandMenu } from '@/command-menu/hooks/useOpenAskAIPageInCommandMenu';
import { useRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilStateV2';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { useCreateChatThreadMutation } from '~/generated-metadata/graphql';

export const useCreateNewAIChatThread = () => {
  const [, setCurrentAIChatThread] = useRecoilStateV2(
    currentAIChatThreadStateV2,
  );
  const setAgentChatUsage = useSetRecoilStateV2(agentChatUsageStateV2);
  const setCurrentAIChatThreadTitle = useSetRecoilStateV2(
    currentAIChatThreadTitleStateV2,
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
