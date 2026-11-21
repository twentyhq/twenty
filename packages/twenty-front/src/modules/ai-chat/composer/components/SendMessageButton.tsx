import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { type AiChatInstanceEventDetail } from '@/ai-chat/types/AiChatInstanceEventDetail';
import { AI_CHAT_SEND_MESSAGE_EVENT_NAME } from '@/ai-chat/constants/AiChatSendMessageEventName';
import { useStopAiChatStream } from '@/ai-chat/hooks/useStopAiChatStream';
import { aiChatThreadIsFetchingMessagesFamilyState } from '@/ai-chat/states/server/aiChatThreadIsFetchingMessagesFamilyState';
import { aiChatThreadReplyStatusFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyStatusFamilyState';
import { aiChatInputIsEmptyFamilySelector } from '@/ai-chat/composer/states/selectors/aiChatInputIsEmptyFamilySelector';
import { aiChatIsAssistantReplyPendingFamilySelector } from '@/ai-chat/messages/states/selectors/aiChatIsAssistantReplyPendingFamilySelector';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { IconButton } from 'twenty-ui/components/input';
import { IconArrowUp, IconPlayerStop } from 'twenty-ui/icon';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useLingui } from '@lingui/react/macro';

type SendMessageButtonProps = {
  isDisabled?: boolean;
};

export const SendMessageButton = ({
  isDisabled = false,
}: SendMessageButtonProps) => {
  const { t } = useLingui();
  const { instanceId, threadId } = useAiChatInstanceOrThrow();
  const aiChatInputIsEmpty = useAtomFamilySelectorValue(
    aiChatInputIsEmptyFamilySelector,
    threadId,
  );
  const aiChatThreadIsFetchingMessages = useAtomFamilyStateValue(
    aiChatThreadIsFetchingMessagesFamilyState,
    { threadId },
  );
  const aiChatThreadReplyStatus = useAtomFamilyStateValue(
    aiChatThreadReplyStatusFamilyState,
    { threadId },
  );
  const isAiChatStreaming = aiChatThreadReplyStatus === 'streaming';
  const { stopAiChatStream } = useStopAiChatStream();
  const aiChatIsAssistantReplyPending = useAtomFamilySelectorValue(
    aiChatIsAssistantReplyPendingFamilySelector,
    threadId,
  );

  const handleSendClick = () => {
    dispatchBrowserEvent<AiChatInstanceEventDetail>(
      AI_CHAT_SEND_MESSAGE_EVENT_NAME,
      { instanceId },
    );
  };

  if (isAiChatStreaming || aiChatIsAssistantReplyPending) {
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
