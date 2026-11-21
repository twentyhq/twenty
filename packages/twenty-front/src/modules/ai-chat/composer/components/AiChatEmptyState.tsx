import { MarkdownRenderer } from '@/ai-chat/message-content/components/MarkdownRenderer';
import { StyledAiChatContentContainer } from '@/ai-chat/components/StyledAiChatContentContainer';
import { styled } from '@linaria/react';

import { AiChatSuggestedPrompts } from '@/ai-chat/suggested-prompts/components/AiChatSuggestedPrompts';
import { useApplyAiChatPreprompt } from '@/ai-chat/composer/hooks/useApplyAiChatPreprompt';
import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { useShouldShowAiChatEmptyState } from '@/ai-chat/hooks/useShouldShowAiChatEmptyState';

const StyledEmptyState = styled(StyledAiChatContentContainer)`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: flex-end;
`;

type AiChatEmptyStateProps = {
  isCentered?: boolean;
};

export const AiChatEmptyState = ({
  isCentered = false,
}: AiChatEmptyStateProps) => {
  const shouldShowAiChatEmptyState = useShouldShowAiChatEmptyState();
  const { applyAiChatPreprompt } = useApplyAiChatPreprompt();
  const { instanceId, threadId, onThreadChange } = useAiChatInstanceOrThrow();

  MarkdownRenderer.preload();

  if (!shouldShowAiChatEmptyState) {
    return null;
  }

  return (
    <StyledEmptyState>
      <AiChatSuggestedPrompts
        isCentered={isCentered}
        onPromptSelect={({ serializedDocument, mode }) =>
          applyAiChatPreprompt({
            threadId,
            instanceId,
            onThreadChange,
            serializedDocument,
            mode,
          })
        }
      />
    </StyledEmptyState>
  );
};
