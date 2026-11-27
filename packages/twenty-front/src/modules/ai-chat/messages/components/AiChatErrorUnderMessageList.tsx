import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { AiChatErrorRenderer } from '@/ai-chat/messages/components/AiChatErrorRenderer';
import { aiChatThreadReplyErrorFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyErrorFamilyState';
import { aiChatThreadIsStreamingFamilySelector } from '@/ai-chat/states/selectors/aiChatThreadIsStreamingFamilySelector';
import { aiChatIsLastMessageFromUserFamilySelector } from '@/ai-chat/messages/states/selectors/aiChatIsLastMessageFromUserFamilySelector';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

const StyledErrorWrapper = styled.div`
  padding-top: ${themeCssVariables.spacing[3]};
`;

export const AiChatErrorUnderMessageList = () => {
  const { threadId } = useAiChatInstanceOrThrow();
  const aiChatThreadReplyError = useAtomFamilyStateValue(
    aiChatThreadReplyErrorFamilyState,
    {
      threadId,
    },
  );
  const aiChatThreadIsStreaming = useAtomFamilySelectorValue(
    aiChatThreadIsStreamingFamilySelector,
    { threadId },
  );

  const aiChatIsLastMessageFromUser = useAtomFamilySelectorValue(
    aiChatIsLastMessageFromUserFamilySelector,
    threadId,
  );

  const showError =
    aiChatThreadReplyError &&
    !aiChatThreadIsStreaming &&
    aiChatIsLastMessageFromUser;

  if (!showError) {
    return null;
  }

  return (
    <StyledErrorWrapper>
      <AiChatErrorRenderer error={aiChatThreadReplyError} />
    </StyledErrorWrapper>
  );
};
