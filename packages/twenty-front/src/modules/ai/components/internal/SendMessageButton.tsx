import { AGENT_CHAT_STOP_EVENT_NAME } from '@/ai/constants/AgentChatStopEventName';
import { agentChatInputIsEmptySelector } from '@/ai/states/selectors/agentChatInputIsEmptySelector';
import { agentChatIsAwaitingFirstChunkComponentFamilyState } from '@/ai/states/agentChatIsAwaitingFirstChunkComponentFamilyState';
import { agentChatIsLoadingState } from '@/ai/states/agentChatIsLoadingState';
import { agentChatIsStreamingComponentFamilyState } from '@/ai/states/agentChatIsStreamingComponentFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { IconArrowUp, IconPlayerStop } from 'twenty-ui/icon';
import { RoundedIconButton } from 'twenty-ui/input';

type SendMessageButtonProps = {
  onSend: () => void;
  isDisabled?: boolean;
};

export const SendMessageButton = ({
  onSend,
  isDisabled = false,
}: SendMessageButtonProps) => {
  const agentChatInputIsEmpty = useAtomStateValue(
    agentChatInputIsEmptySelector,
  );

  const agentChatIsLoading = useAtomStateValue(agentChatIsLoadingState);

  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const agentChatIsStreaming = useAtomComponentFamilyStateValue(
    agentChatIsStreamingComponentFamilyState,
    { threadId: currentAiChatThread },
  );
  const agentChatIsAwaitingFirstChunk = useAtomComponentFamilyStateValue(
    agentChatIsAwaitingFirstChunkComponentFamilyState,
    { threadId: currentAiChatThread },
  );

  const handleStopClick = () => {
    dispatchBrowserEvent(AGENT_CHAT_STOP_EVENT_NAME);
  };

  if (agentChatIsStreaming || agentChatIsAwaitingFirstChunk) {
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
      disabled={isDisabled || agentChatInputIsEmpty || agentChatIsLoading}
    />
  );
};
