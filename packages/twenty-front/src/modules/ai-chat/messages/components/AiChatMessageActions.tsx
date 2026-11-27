import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconArrowBackUp, IconEdit, IconTrash } from 'twenty-ui/icon';

import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { AiChatMessageReactionPicker } from '@/ai-chat/messages/components/AiChatMessageReactionPicker';
import { aiChatComposerQuotedMessageIdFamilyState } from '@/ai-chat/states/composer/aiChatComposerQuotedMessageIdFamilyState';
import { aiChatComposerShouldFocusFamilyState } from '@/ai-chat/states/composer/aiChatComposerShouldFocusFamilyState';
import { ChatMessageCopyAction } from '@/chat/components/ChatMessageCopyAction';
import { ChatMessageFloatingActions } from '@/chat/components/ChatMessageFloatingActions';
import { StyledChatMessageActions } from '@/chat/components/StyledChatMessageActions';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';

type AiChatMessageActionsProps = {
  messageId: string;
  messageText: string;
  isRightAligned: boolean;
  isFloating?: boolean;
  canReact: boolean;
  canReply: boolean;
  onEdit?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
};

export const AiChatMessageActions = ({
  messageId,
  messageText,
  isRightAligned,
  isFloating = false,
  canReact,
  canReply,
  onEdit,
  onDelete,
}: AiChatMessageActionsProps) => {
  const { t } = useLingui();
  const { threadId } = useAiChatInstanceOrThrow();
  const setAiChatComposerQuotedMessageId = useSetAtomFamilyState(
    aiChatComposerQuotedMessageIdFamilyState,
    { threadId },
  );
  const setAiChatComposerShouldFocus = useSetAtomFamilyState(
    aiChatComposerShouldFocusFamilyState,
    { threadId },
  );

  const actions = (
    <>
      {canReact && <AiChatMessageReactionPicker messageId={messageId} />}
      {canReply && (
        <LightIconButton
          aria-label={t`Reply`}
          onClick={() => {
            setAiChatComposerQuotedMessageId(messageId);
            setAiChatComposerShouldFocus(true);
          }}
        >
          <IconArrowBackUp />
        </LightIconButton>
      )}
      <ChatMessageCopyAction text={messageText} />
      {isDefined(onEdit) && (
        <LightIconButton
          aria-label={t`Edit message`}
          tooltip={t`Edit message`}
          onClick={() => onEdit(messageId)}
        >
          <IconEdit />
        </LightIconButton>
      )}
      {isDefined(onDelete) && (
        <LightIconButton
          aria-label={t`Delete message`}
          tooltip={t`Delete message`}
          onClick={() => onDelete(messageId)}
        >
          <IconTrash />
        </LightIconButton>
      )}
    </>
  );

  if (isFloating) {
    return (
      <ChatMessageFloatingActions isRightAligned={isRightAligned}>
        {actions}
      </ChatMessageFloatingActions>
    );
  }

  return (
    <StyledChatMessageActions
      className="message-actions"
      isRightAligned={isRightAligned}
    >
      {actions}
    </StyledChatMessageActions>
  );
};
