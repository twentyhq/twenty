import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { useStopAiChatStream } from '@/ai-chat/hooks/useStopAiChatStream';
import { aiChatThreadIsFetchingMessagesFamilyState } from '@/ai-chat/states/server/aiChatThreadIsFetchingMessagesFamilyState';
import { aiChatThreadIsStreamingFamilySelector } from '@/ai-chat/states/selectors/aiChatThreadIsStreamingFamilySelector';
import { aiChatInputIsEmptyFamilySelector } from '@/ai-chat/composer/states/selectors/aiChatInputIsEmptyFamilySelector';
import { aiChatIsAssistantReplyPendingFamilySelector } from '@/ai-chat/messages/states/selectors/aiChatIsAssistantReplyPendingFamilySelector';
import { IconButton } from 'twenty-ui/components/input';
import { IconArrowUp, IconPlayerStop } from 'twenty-ui/icon';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useLingui } from '@lingui/react/macro';
import { type Editor } from '@tiptap/react';
import { isDefined } from 'twenty-shared/utils';

import { useSendAiChatComposerMessage } from '@/ai-chat/composer/hooks/useSendAiChatComposerMessage';

type AiChatSendMessageButtonProps = {
  isDisabled?: boolean;
  editor: Editor | null;
};

export const AiChatSendMessageButton = ({
  isDisabled = false,
  editor,
}: AiChatSendMessageButtonProps) => {
  const { t } = useLingui();
  const { threadId } = useAiChatInstanceOrThrow();
  const aiChatInputIsEmpty = useAtomFamilySelectorValue(
    aiChatInputIsEmptyFamilySelector,
    threadId,
  );
  const aiChatThreadIsFetchingMessages = useAtomFamilyStateValue(
    aiChatThreadIsFetchingMessagesFamilyState,
    { threadId },
  );
  const aiChatThreadIsStreaming = useAtomFamilySelectorValue(
    aiChatThreadIsStreamingFamilySelector,
    { threadId },
  );
  const { stopAiChatStream } = useStopAiChatStream();
  const { sendAiChatComposerMessage } = useSendAiChatComposerMessage();

  const handleSendClick = () => {
    sendAiChatComposerMessage(
      isDefined(editor)
        ? { element: editor.view.dom, text: editor.getText() }
        : undefined,
    );
  };
  const aiChatIsAssistantReplyPending = useAtomFamilySelectorValue(
    aiChatIsAssistantReplyPendingFamilySelector,
    threadId,
  );

  if (aiChatThreadIsStreaming || aiChatIsAssistantReplyPending) {
    return (
      <IconButton
        variant="solid"
        color="accent"
        shape="round"
        aria-label={t`Stop response`}
        size="sm"
        onClick={() => void stopAiChatStream()}
      >
        <IconPlayerStop />
      </IconButton>
    );
  }

  return (
    <IconButton
      variant="solid"
      color="accent"
      shape="round"
      aria-label={t`Send message`}
      size="sm"
      onClick={handleSendClick}
      disabled={
        isDisabled || aiChatInputIsEmpty || aiChatThreadIsFetchingMessages
      }
    >
      <IconArrowUp />
    </IconButton>
  );
};
