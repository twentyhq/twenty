import { styled } from '@linaria/react';
import { type Editor } from '@tiptap/react';
import { isDefined } from 'twenty-shared/utils';

import { AIChatSuggestedPrompts } from '@/ai/components/suggested-prompts/AIChatSuggestedPrompts';
import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatMessagesLoadingState } from '@/ai/states/agentChatMessagesLoadingState';
import { agentChatThreadsLoadingState } from '@/ai/states/agentChatThreadsLoadingState';
import { agentChatErrorState } from '@/ai/states/agentChatErrorState';
import { agentChatHasMessageComponentSelector } from '@/ai/states/agentChatHasMessageComponentSelector';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { skipMessagesSkeletonUntilLoadedState } from '@/ai/states/skipMessagesSkeletonUntilLoadedState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledEmptyState = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  justify-content: flex-end;
`;

type AIChatEmptyStateProps = {
  editor: Editor | null;
};

export const AIChatEmptyState = ({ editor }: AIChatEmptyStateProps) => {
  const agentChatError = useAtomStateValue(agentChatErrorState);
  const agentChatThreadsLoading = useAtomStateValue(
    agentChatThreadsLoadingState,
  );
  const agentChatMessagesLoading = useAtomStateValue(
    agentChatMessagesLoadingState,
  );
  const skipMessagesSkeletonUntilLoaded = useAtomStateValue(
    skipMessagesSkeletonUntilLoadedState,
  );
  const currentAIChatThread = useAtomStateValue(currentAIChatThreadState);

  const hasMessages = useAtomComponentSelectorValue(
    agentChatHasMessageComponentSelector,
  );

  const isOnNewChatSlot =
    currentAIChatThread === AGENT_CHAT_NEW_THREAD_DRAFT_KEY;
  const skeletonShowing =
    (agentChatThreadsLoading && isOnNewChatSlot) ||
    (agentChatMessagesLoading && !skipMessagesSkeletonUntilLoaded);
  const shouldRender =
    !hasMessages && !isDefined(agentChatError) && !skeletonShowing;

  if (!shouldRender) {
    return null;
  }

  return (
    <StyledEmptyState>
      <AIChatSuggestedPrompts editor={editor} />
    </StyledEmptyState>
  );
};
