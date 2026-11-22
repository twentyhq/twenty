import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { aiChatThreadReplyErrorFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyErrorFamilyState';
import { isAiChatCreditsExhaustedError } from '@/ai-chat/usage/utils/isAiChatCreditsExhaustedError';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { hasReachedCurrentBillingPeriodCapSelector } from '@/workspace/states/hasReachedCurrentBillingPeriodCapSelector';
import { isResourceCreditSubscriptionItem } from '@/workspace/utils/isResourceCreditSubscriptionItem';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const useHasReachedAiChatCreditsCap = () => {
  const hasReachedCurrentBillingPeriodCap = useAtomStateValue(
    hasReachedCurrentBillingPeriodCapSelector,
  );
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const { threadId } = useAiChatInstanceOrThrow();
  const aiChatThreadReplyError = useAtomFamilyStateValue(
    aiChatThreadReplyErrorFamilyState,
    {
      threadId,
    },
  );

  if (hasReachedCurrentBillingPeriodCap) {
    return true;
  }

  const hasResourceCreditSubscriptionItem =
    currentWorkspace?.currentBillingSubscription?.billingSubscriptionItems?.some(
      isResourceCreditSubscriptionItem,
    ) ?? false;

  if (hasResourceCreditSubscriptionItem) {
    return false;
  }

  return isAiChatCreditsExhaustedError(aiChatThreadReplyError);
};
