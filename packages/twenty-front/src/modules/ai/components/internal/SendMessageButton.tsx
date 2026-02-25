import { agentChatInputIsEmptySelector } from '@/ai/states/agentChatInputIsEmptySelector';
import { agentChatIsLoadingState } from '@/ai/states/agentChatIsLoadingState';
import { agentChatIsStreamingState } from '@/ai/states/agentChatIsStreamingState';
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

  const agentChatIsStreaming = useAtomStateValue(agentChatIsStreamingState);

  if (agentChatIsStreaming) {
    return (
      <RoundedIconButton
        Icon={IconPlayerStop}
        size="medium"
        onClick={() => {}}
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
