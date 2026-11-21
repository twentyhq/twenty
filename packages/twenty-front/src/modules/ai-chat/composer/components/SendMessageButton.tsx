import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { useStopAiChatStream } from '@/ai-chat/hooks/useStopAiChatStream';
import { aiChatThreadIsFetchingMessagesFamilyState } from '@/ai-chat/states/server/aiChatThreadIsFetchingMessagesFamilyState';
import { aiChatThreadReplyStatusFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyStatusFamilyState';
import { aiChatInputIsEmptyFamilySelector } from '@/ai-chat/composer/states/selectors/aiChatInputIsEmptyFamilySelector';
import { aiChatIsAssistantReplyPendingFamilySelector } from '@/ai-chat/messages/states/selectors/aiChatIsAssistantReplyPendingFamilySelector';
import { IconButton } from 'twenty-ui/components/input';
import { IconArrowUp, IconPlayerStop } from 'twenty-ui/icon';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useLingui } from '@lingui/react/macro';

type SendMessageButtonProps = {
  isDisabled?: boolean;
  onSend: () => void;
};

export const SendMessageButton = ({
  isDisabled = false,
  onSend,
}: SendMessageButtonProps) => {
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
      onClick={onSend}
      disabled={
        isDisabled || aiChatInputIsEmpty || aiChatThreadIsFetchingMessages
      }
    >
      <IconArrowUp />
    </IconButton>
  );
};
