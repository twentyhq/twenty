import { AI_CHAT_INPUT_ID } from '@/ai/constants/AiChatInputId';
import { useAgentChatContextOrThrow } from '@/ai/hooks/useAgentChatContextOrThrow';
import { agentChatInputState } from '@/ai/states/agentChatInputState';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';
import { IconArrowUp } from 'twenty-ui/display';
import { RoundedIconButton } from 'twenty-ui/input';

export const SendMessageButton = () => {
  const agentChatInput = useRecoilValue(agentChatInputState);
  const { handleSendMessage, isLoading } = useAgentChatContextOrThrow();

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

  return (
    <RoundedIconButton
      Icon={IconArrowUp}
      onClick={() => handleSendMessage()}
      disabled={!agentChatInput || isLoading}
    />
  );
};
