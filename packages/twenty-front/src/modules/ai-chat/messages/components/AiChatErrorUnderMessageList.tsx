import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { AiChatErrorRenderer } from '@/ai-chat/messages/components/AiChatErrorRenderer';
import { aiChatErrorFamilyState } from '@/ai-chat/states/aiChatErrorFamilyState';
import { aiChatIsStreamingFamilySelector } from '@/ai-chat/states/selectors/aiChatIsStreamingFamilySelector';
import { aiChatIsLastMessageFromUserFamilySelector } from '@/ai-chat/messages/states/selectors/aiChatIsLastMessageFromUserFamilySelector';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

const StyledErrorWrapper = styled.div`
  padding-top: ${themeCssVariables.spacing[3]};
`;

export const AiChatErrorUnderMessageList = () => {
  const { threadId } = useAiChatInstanceOrThrow();
  const aiChatError = useAtomFamilyStateValue(aiChatErrorFamilyState, {
    threadId,
  });
  const aiChatIsStreaming = useAtomFamilySelectorValue(
    aiChatIsStreamingFamilySelector,
    threadId,
  );

  const aiChatIsLastMessageFromUser = useAtomFamilySelectorValue(
    aiChatIsLastMessageFromUserFamilySelector,
    threadId,
  );

  const showError =
    aiChatError && !aiChatIsStreaming && aiChatIsLastMessageFromUser;

  if (!showError) {
    return null;
  }

  return (
    <StyledErrorWrapper>
      <AiChatErrorRenderer error={aiChatError} />
    </StyledErrorWrapper>
  );
};
