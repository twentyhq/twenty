import { useAiChatComposerThreadId } from '@/ai/hooks/useAiChatComposerThreadId';
import { type AiChatThreadEventDetail } from '@/ai/types/AiChatThreadEventDetail';
import { useAiChatThreadId } from '@/ai/hooks/useAiChatThreadId';
import { AI_CHAT_SEND_MESSAGE_EVENT_NAME } from '@/ai/constants/AiChatSendMessageEventName';
import { AI_CHAT_STOP_EVENT_NAME } from '@/ai/constants/AiChatStopEventName';
import { aiChatIsLoadingSelector } from '@/ai/states/selectors/aiChatIsLoadingSelector';
import { aiChatIsStreamingFamilyState } from '@/ai/states/aiChatIsStreamingFamilyState';
import { aiChatInputIsEmptySelector } from '@/ai/states/selectors/aiChatInputIsEmptySelector';
import { aiChatIsAssistantReplyPendingFamilySelector } from '@/ai/states/selectors/aiChatIsAssistantReplyPendingFamilySelector';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
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
  const aiChatInputIsEmpty = useAtomStateValue(aiChatInputIsEmptySelector);

  const aiChatIsLoading = useAtomStateValue(aiChatIsLoadingSelector);

  const currentAiChatThread = useAiChatThreadId();
  const aiChatIsStreaming = useAtomFamilyStateValue(
    aiChatIsStreamingFamilyState,
    { threadId: currentAiChatThread },
  );
  const aiChatIsAssistantReplyPending = useAtomFamilySelectorValue(
    aiChatIsAssistantReplyPendingFamilySelector,
    currentAiChatThread,
  );

  const aiChatComposerThreadId = useAiChatComposerThreadId();

  const handleSendClick = () => {
    dispatchBrowserEvent<AiChatThreadEventDetail>(
      AI_CHAT_SEND_MESSAGE_EVENT_NAME,
      { threadId: aiChatComposerThreadId },
    );
  };

  const handleStopClick = () => {
    dispatchBrowserEvent<AiChatThreadEventDetail>(AI_CHAT_STOP_EVENT_NAME, {
      threadId: aiChatComposerThreadId,
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
