import { styled } from '@linaria/react';
import { type Editor } from '@tiptap/react';

import { AIChatSuggestedPrompts } from '@/ai/components/suggested-prompts/AIChatSuggestedPrompts';
import { agentChatErrorState } from '@/ai/states/agentChatErrorState';
import { agentChatHasMessageComponentSelector } from '@/ai/states/agentChatHasMessageComponentSelector';
import { agentChatIsLoadingState } from '@/ai/states/agentChatIsLoadingState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

const StyledEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: flex-end;
  height: 100%;
`;

type AIChatEmptyStateProps = {
  editor: Editor | null;
};

export const AIChatEmptyState = ({ editor }: AIChatEmptyStateProps) => {
  const agentChatIsLoading = useAtomStateValue(agentChatIsLoadingState);

  const agentChatError = useAtomStateValue(agentChatErrorState);

  const hasMessages = useAtomComponentSelectorValue(
    agentChatHasMessageComponentSelector,
  );

  const shouldRender =
    !hasMessages && !isDefined(agentChatError) && !agentChatIsLoading;

  if (!shouldRender) {
    return null;
  }

  return (
    <StyledEmptyState>
      <AIChatSuggestedPrompts editor={editor} />
    </StyledEmptyState>
  );
};
