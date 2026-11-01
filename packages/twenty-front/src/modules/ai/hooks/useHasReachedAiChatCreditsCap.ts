import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatErrorFamilyState } from '@/ai/states/agentChatErrorFamilyState';
import { isAiChatCreditsExhaustedError } from '@/ai/utils/isAiChatCreditsExhaustedError';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { hasReachedCurrentBillingPeriodCapSelector } from '@/workspace/states/hasReachedCurrentBillingPeriodCapSelector';
import { isResourceCreditSubscriptionItem } from '@/workspace/utils/isResourceCreditSubscriptionItem';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

// The credits error renders nothing, so this keeps the banner mounted. The resource credit item's flag is
// authoritative; the thread error stands in only without the item, else it would outlive an upgrade.
export const useHasReachedAiChatCreditsCap = () => {
  const hasReachedCurrentBillingPeriodCap = useAtomStateValue(
    hasReachedCurrentBillingPeriodCapSelector,
  );
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const agentChatDisplayedThread = useAtomStateValue(
    agentChatDisplayedThreadState,
  );
  const agentChatError = useAtomFamilyStateValue(agentChatErrorFamilyState, {
    threadId: agentChatDisplayedThread,
  });

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

  return isAiChatCreditsExhaustedError(agentChatError);
};
