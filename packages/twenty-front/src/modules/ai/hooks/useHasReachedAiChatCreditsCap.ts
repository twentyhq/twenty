import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatErrorComponentFamilyState } from '@/ai/states/agentChatErrorComponentFamilyState';
import { AiChatErrorCode } from '@/ai/utils/aiChatErrorCode';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { hasReachedCurrentBillingPeriodCapSelector } from '@/workspace/states/hasReachedCurrentBillingPeriodCapSelector';
import { BillingProductKey } from '~/generated-metadata/graphql';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

// The credits exhausted error renders nothing on its own, so the banner must
// mount whenever the workspace is refused for lack of credits. The resource
// credit item's flag is the authoritative signal: a refused send marks it, an
// upgrade or a successful send clears it. The thread error only stands in when
// client state carries no resource credit item to hold the flag; when the item
// exists, trusting a leftover error would keep the banner up after an upgrade.
export const useHasReachedAiChatCreditsCap = () => {
  const hasReachedCurrentBillingPeriodCap = useAtomStateValue(
    hasReachedCurrentBillingPeriodCapSelector,
  );
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const agentChatDisplayedThread = useAtomStateValue(
    agentChatDisplayedThreadState,
  );
  const agentChatError = useAtomComponentFamilyStateValue(
    agentChatErrorComponentFamilyState,
    { threadId: agentChatDisplayedThread },
  );

  if (hasReachedCurrentBillingPeriodCap) {
    return true;
  }

  const hasResourceCreditSubscriptionItem =
    currentWorkspace?.currentBillingSubscription?.billingSubscriptionItems?.some(
      (item) =>
        item.billingProduct.metadata?.['productKey'] ===
        BillingProductKey.RESOURCE_CREDIT,
    ) ?? false;

  if (hasResourceCreditSubscriptionItem) {
    return false;
  }

  return isGraphqlErrorOfType(
    agentChatError,
    AiChatErrorCode.BILLING_CREDITS_EXHAUSTED,
  );
};
