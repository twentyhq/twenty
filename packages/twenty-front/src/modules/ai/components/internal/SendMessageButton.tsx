import { useAgentChatContextOrThrow } from '@/ai/hooks/useAgentChatContextOrThrow';
import { agentChatInputState } from '@/ai/states/agentChatInputState';
import { useRecoilValue } from 'recoil';
import { IconArrowUp, IconPlayerStop } from 'twenty-ui/display';
import { RoundedIconButton } from 'twenty-ui/input';

// Enter-to-send is handled by the Tiptap editor's handleKeyDown in useAIChatEditor.
// The global hotkey was removed to prevent double-send (Tiptap consumes the event
// but does not stop propagation, so a document-level listener would fire again).
export const SendMessageButton = () => {
  const agentChatInput = useRecoilValue(agentChatInputState);
  const { handleSendMessage, handleStop, isLoading, isStreaming } =
    useAgentChatContextOrThrow();

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
      onClick={() => handleSendMessage()}
      disabled={!agentChatInput || isLoading}
    />
  );
};
