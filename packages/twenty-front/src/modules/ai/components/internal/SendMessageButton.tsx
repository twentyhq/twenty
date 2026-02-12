import { AI_CHAT_INPUT_ID } from '@/ai/constants/AiChatInputId';
import { useAgentChatContextOrThrow } from '@/ai/hooks/useAgentChatContextOrThrow';
import { agentChatInputState } from '@/ai/states/agentChatInputState';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';
import { IconArrowUp, IconPlayerStop } from 'twenty-ui/display';
import { RoundedIconButton } from 'twenty-ui/input';

export const SendMessageButton = () => {
  const agentChatInput = useRecoilValue(agentChatInputState);
  const { handleSendMessage, handleStop, isLoading, isStreaming } =
    useAgentChatContextOrThrow();

  useHotkeysOnFocusedElement({
    keys: [Key.Enter],
    callback: (event: KeyboardEvent) => {
      if (!event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        handleSendMessage();
      }
    },
    focusId: AI_CHAT_INPUT_ID,
    dependencies: [agentChatInput, isLoading],
    options: {
      enableOnFormTags: true,
    },
  });

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
