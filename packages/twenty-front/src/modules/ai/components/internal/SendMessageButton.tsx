import { AGENT_CHAT_STOP_EVENT_NAME } from '@/ai/constants/AgentChatStopEventName';
import { agentChatInputIsEmptySelector } from '@/ai/states/agentChatInputIsEmptySelector';
import { agentChatIsLoadingState } from '@/ai/states/agentChatIsLoadingState';
import { agentChatIsStreamingComponentState } from '@/ai/states/agentChatIsStreamingComponentState';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
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

  const agentChatIsStreaming = useAtomComponentStateValue(
    agentChatIsStreamingComponentState,
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
