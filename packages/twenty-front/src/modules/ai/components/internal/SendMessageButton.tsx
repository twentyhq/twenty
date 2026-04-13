import { AGENT_CHAT_STOP_EVENT_NAME } from '@/ai/constants/AgentChatStopEventName';
import { agentChatInputIsEmptySelector } from '@/ai/states/agentChatInputIsEmptySelector';
import { agentChatIsLoadingState } from '@/ai/states/agentChatIsLoadingState';
import { agentChatIsStreamingComponentFamilyState } from '@/ai/states/agentChatIsStreamingComponentFamilyState';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { IconArrowUp, IconPlayerStop } from 'twenty-ui/display';
import { RoundedIconButton } from 'twenty-ui/input';

type SendMessageButtonProps = {
  onSend: () => void;
};

export const SendMessageButton = ({ onSend }: SendMessageButtonProps) => {
  const agentChatInputIsEmpty = useAtomStateValue(
    agentChatInputIsEmptySelector,
  );

  const agentChatIsLoading = useAtomStateValue(agentChatIsLoadingState);

  const currentAIChatThread = useAtomStateValue(currentAIChatThreadState);
  const agentChatIsStreaming = useAtomComponentFamilyStateValue(
    agentChatIsStreamingComponentFamilyState,
    { threadId: currentAIChatThread },
  );

  const handleStopClick = () => {
    dispatchBrowserEvent(AGENT_CHAT_STOP_EVENT_NAME);
  };

  if (agentChatIsStreaming) {
    return (
      <RoundedIconButton
        Icon={IconPlayerStop}
        size="medium"
        onClick={handleStopClick}
      />
    );
  }

  return (
    <RoundedIconButton
      Icon={IconArrowUp}
      size="medium"
      onClick={onSend}
      disabled={agentChatInputIsEmpty || agentChatIsLoading}
    />
  );
};
