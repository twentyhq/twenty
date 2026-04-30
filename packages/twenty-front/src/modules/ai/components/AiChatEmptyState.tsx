import { styled } from '@linaria/react';
import { type Editor } from '@tiptap/react';
import { isDefined } from 'twenty-shared/utils';

import { AiChatSuggestedPrompts } from '@/ai/components/suggested-prompts/AiChatSuggestedPrompts';
import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatErrorComponentFamilyState } from '@/ai/states/agentChatErrorComponentFamilyState';
import { agentChatHasMessageComponentSelector } from '@/ai/states/agentChatHasMessageComponentSelector';
import { agentChatMessagesLoadingState } from '@/ai/states/agentChatMessagesLoadingState';
import { agentChatThreadsLoadingState } from '@/ai/states/agentChatThreadsLoadingState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { skipMessagesSkeletonUntilLoadedState } from '@/ai/states/skipMessagesSkeletonUntilLoadedState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledEmptyState = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  justify-content: flex-end;
`;

type AiChatEmptyStateProps = {
  editor: Editor | null;
};

export const AiChatEmptyState = ({ editor }: AiChatEmptyStateProps) => {
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const agentChatError = useAtomComponentFamilyStateValue(
    agentChatErrorComponentFamilyState,
    { threadId: currentAiChatThread },
  );
  const agentChatThreadsLoading = useAtomStateValue(
    agentChatThreadsLoadingState,
  );
  const agentChatMessagesLoading = useAtomStateValue(
    agentChatMessagesLoadingState,
  );
  const skipMessagesSkeletonUntilLoaded = useAtomStateValue(
    skipMessagesSkeletonUntilLoadedState,
  );

  const hasMessages = useAtomComponentSelectorValue(
    agentChatHasMessageComponentSelector,
  );

  const isOnNewChatSlot =
    currentAiChatThread === AGENT_CHAT_NEW_THREAD_DRAFT_KEY;
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
      <AiChatSuggestedPrompts editor={editor} />
    </StyledEmptyState>
  );
};
