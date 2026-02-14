import { useAgentChatContextOrThrow } from '@/ai/hooks/useAgentChatContextOrThrow';
import { agentChatInputState } from '@/ai/states/agentChatInputState';
import { useRecoilValue } from 'recoil';
import { IconArrowUp, IconPlayerStop } from 'twenty-ui/display';
import { RoundedIconButton } from 'twenty-ui/input';

type SendMessageButtonProps = {
  onSend: () => void;
};

export const SendMessageButton = ({ onSend }: SendMessageButtonProps) => {
  const agentChatInput = useRecoilValue(agentChatInputState);
  const { handleStop, isLoading, isStreaming } = useAgentChatContextOrThrow();

  if (isStreaming) {
    return (
      <RoundedIconButton
        Icon={IconPlayerStop}
        size="medium"
        onClick={() => handleStop()}
      />
    );
  }

  return (
    <RoundedIconButton
      Icon={IconArrowUp}
      size="medium"
      onClick={onSend}
      disabled={!agentChatInput || isLoading}
    />
  );
};
