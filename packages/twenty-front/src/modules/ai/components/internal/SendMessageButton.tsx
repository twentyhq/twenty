import { AI_CHAT_INPUT_ID } from '@/ai/constants/AiChatInputId';
import { useAgentChatContext } from '@/ai/hooks/useAgentChatContext';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { t } from '@lingui/core/macro';
import { Key } from 'ts-key-enum';
import { Button } from 'twenty-ui/input';

export const SendMessageButton = ({
  records,
}: {
  records?: ObjectRecord[];
}) => {
  const { handleSendMessage, isLoading, input } = useAgentChatContext();

  useHotkeysOnFocusedElement({
    keys: [Key.Enter],
    callback: (event: KeyboardEvent) => {
      if (!event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        handleSendMessage(records);
      }
    },
    focusId: AI_CHAT_INPUT_ID,
    dependencies: [input, isLoading],
    options: {
      enableOnFormTags: true,
    },
  });

  return (
    <Button
      hotkeys={input && !isLoading ? ['⏎'] : undefined}
      onClick={() => handleSendMessage(records)}
      disabled={!input || isLoading}
      variant="primary"
      accent="blue"
      size="small"
      title={t`Send`}
    />
  );
};
