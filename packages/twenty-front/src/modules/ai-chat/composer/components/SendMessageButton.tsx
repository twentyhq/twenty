import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { type AiChatInstanceEventDetail } from '@/ai-chat/types/AiChatInstanceEventDetail';
import { AI_CHAT_SEND_MESSAGE_EVENT_NAME } from '@/ai-chat/constants/AiChatSendMessageEventName';
import { AI_CHAT_STOP_EVENT_NAME } from '@/ai-chat/constants/AiChatStopEventName';
import { aiChatIsLoadingFamilySelector } from '@/ai-chat/states/selectors/aiChatIsLoadingFamilySelector';
import { aiChatIsStreamingFamilyState } from '@/ai-chat/states/aiChatIsStreamingFamilyState';
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
  const aiChatIsLoading = useAtomFamilySelectorValue(
    aiChatIsLoadingFamilySelector,
    threadId,
  );
  const aiChatIsStreaming = useAtomFamilyStateValue(
    aiChatIsStreamingFamilyState,
    { threadId },
  );
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

  const handleStopClick = () => {
    dispatchBrowserEvent<AiChatInstanceEventDetail>(AI_CHAT_STOP_EVENT_NAME, {
      instanceId,
    });
  };

  if (aiChatIsStreaming || aiChatIsAssistantReplyPending) {
    return (
      <IconButton
        variant="solid"
        color="accent"
        shape="round"
        aria-label={t`Stop response`}
        size="sm"
        onClick={handleStopClick}
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
      disabled={isDisabled || aiChatInputIsEmpty || aiChatIsLoading}
    >
      <IconArrowUp />
    </IconButton>
  );
};
