import { AI_CHAT_INPUT_ID } from '@/ai/constants/AiChatInputId';
import { useAgentChat } from '@/ai/hooks/useAgentChat';
import { useAgentChatContextOrThrow } from '@/ai/hooks/useAgentChatContextOrThrow';
import { useAgentChatRequestBody } from '@/ai/hooks/useAgentChatRequestBody';
import { agentChatUploadedFilesState } from '@/ai/states/agentChatUploadedFilesState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useChat } from '@ai-sdk/react';
import { t } from '@lingui/core/macro';
import { useRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';
import { Button } from 'twenty-ui/input';

export const SendMessageButton = ({
  agentId,
  records,
}: {
  agentId: string;
  records?: ObjectRecord[];
}) => {
  const { input, isLoading, handleInputChange } = useAgentChat(agentId);
  const { chat } = useAgentChatContextOrThrow();
  const { buildRequestBody } = useAgentChatRequestBody();
  const { sendMessage } = useChat({ chat });

  const [agentChatUploadedFiles, setAgentChatUploadedFiles] = useRecoilState(
    agentChatUploadedFilesState,
  );

  const handleSendMessage = () => {
    if (input.trim() === '' || isLoading) {
      return;
    }

    sendMessage(
      {
        text: input,
        files: agentChatUploadedFiles,
      },
      {
        body: buildRequestBody(records),
      },
    );

    handleInputChange('');
    setAgentChatUploadedFiles([]);
  };

  useHotkeysOnFocusedElement({
    keys: [Key.Enter],
    callback: (event: KeyboardEvent) => {
      if (!event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        handleSendMessage();
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
      onClick={handleSendMessage}
      disabled={!input || isLoading}
      variant="primary"
      accent="blue"
      size="small"
      title={t`Send`}
    />
  );
};
