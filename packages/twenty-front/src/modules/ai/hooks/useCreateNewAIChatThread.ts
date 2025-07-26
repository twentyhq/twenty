import { currentAIChatThreadComponentState } from '@/ai/states/currentAIChatThreadComponentState';
import { useOpenAskAIPageInCommandMenu } from '@/command-menu/hooks/useOpenAskAIPageInCommandMenu';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useCreateAgentChatThreadMutation } from '~/generated-metadata/graphql';

export const useCreateNewAIChatThread = ({ agentId }: { agentId: string }) => {
  const [, setCurrentThreadId] = useRecoilComponentStateV2(
    currentAIChatThreadComponentState,
    agentId,
  );

  const { openAskAIPage } = useOpenAskAIPageInCommandMenu();
  const [createAgentChatThread] = useCreateAgentChatThreadMutation({
    variables: { input: { agentId } },
    onCompleted: (data) => {
      setCurrentThreadId(data.createAgentChatThread.id);
      openAskAIPage();
    },
  });

  return { createAgentChatThread };
};
