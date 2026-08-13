import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatErrorComponentFamilyState } from '@/ai/states/agentChatErrorComponentFamilyState';
import { AiChatErrorCode } from '@/ai/utils/aiChatErrorCode';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { hasReachedCurrentBillingPeriodCapSelector } from '@/workspace/states/hasReachedCurrentBillingPeriodCapSelector';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

// The workspace flag alone is not enough to decide whether to warn the user: a
// workspace can be refused for lack of credits while its resource credit item
// still reports no cap, and the credits exhausted error renders nothing on its
// own. Falling back to the error keeps the chat from failing silently.
export const useHasReachedAiChatCreditsCap = () => {
  const hasReachedCurrentBillingPeriodCap = useAtomStateValue(
    hasReachedCurrentBillingPeriodCapSelector,
  );

  const agentChatDisplayedThread = useAtomStateValue(
    agentChatDisplayedThreadState,
  );
  const agentChatError = useAtomComponentFamilyStateValue(
    agentChatErrorComponentFamilyState,
    { threadId: agentChatDisplayedThread },
  );

  return (
    hasReachedCurrentBillingPeriodCap ||
    isGraphqlErrorOfType(
      agentChatError,
      AiChatErrorCode.BILLING_CREDITS_EXHAUSTED,
    )
  );
};
