import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { isDefined } from 'twenty-shared/utils';

import { useIsOnNewAiChatSlot } from '@/ai-chat/hooks/useIsOnNewAiChatSlot';
import { aiChatErrorFamilyState } from '@/ai-chat/states/aiChatErrorFamilyState';
import { aiChatReplyStatusFamilyState } from '@/ai-chat/states/aiChatReplyStatusFamilyState';
import { aiChatHasMessageFamilySelector } from '@/ai-chat/states/selectors/aiChatHasMessageFamilySelector';
import { useIsMobile } from 'twenty-ui/utilities';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const useShouldShowAiChatEmptyState = () => {
  const { threadId } = useAiChatInstanceOrThrow();
  const aiChatError = useAtomFamilyStateValue(aiChatErrorFamilyState, {
    threadId,
  });
  const aiChatReplyStatus = useAtomFamilyStateValue(
    aiChatReplyStatusFamilyState,
    { threadId },
  );

  const aiChatHasMessage = useAtomFamilySelectorValue(
    aiChatHasMessageFamilySelector,
    threadId,
  );

  const isMobile = useIsMobile();

  const isOnNewAiChatSlot = useIsOnNewAiChatSlot();

  return (
    isOnNewAiChatSlot &&
    !isMobile &&
    !aiChatHasMessage &&
    !isDefined(aiChatError) &&
    aiChatReplyStatus !== 'awaiting-first-chunk' &&
    aiChatReplyStatus !== 'streaming'
  );
};
