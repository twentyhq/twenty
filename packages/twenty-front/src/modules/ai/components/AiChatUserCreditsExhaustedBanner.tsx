import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';

import { AiChatInlineBanner } from '@/ai/components/AiChatInlineBanner';
import { useAiChatUserCreditsUsage } from '@/ai/hooks/useAiChatUserCreditsUsage';
import { useIsWorkspaceSetupChat } from '@/ai/hooks/useIsWorkspaceSetupChat';
import { agentChatUserCreditsBannerDismissedPeriodEndState } from '@/ai/states/agentChatUserCreditsBannerDismissedPeriodEndState';
import { computeDaysUntilReset } from '@/ai/utils/computeDaysUntilReset';
import { isAiChatUserCreditsExhausted } from '@/ai/utils/isAiChatUserCreditsExhausted';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { UserCreditsFallback } from '~/generated-metadata/graphql';

export const AiChatUserCreditsExhaustedBanner = () => {
  const { t } = useLingui();

  const isWorkspaceSetupChat = useIsWorkspaceSetupChat();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const [
    agentChatUserCreditsBannerDismissedPeriodEnd,
    setAgentChatUserCreditsBannerDismissedPeriodEnd,
  ] = useAtomState(agentChatUserCreditsBannerDismissedPeriodEndState);

  const { userCreditsUsage } = useAiChatUserCreditsUsage({
    skip: isWorkspaceSetupChat,
  });

  if (
    !isDefined(userCreditsUsage) ||
    !isAiChatUserCreditsExhausted(userCreditsUsage) ||
    userCreditsUsage.periodEnd === agentChatUserCreditsBannerDismissedPeriodEnd
  ) {
    return null;
  }

  const daysUntilReset = computeDaysUntilReset(userCreditsUsage.periodEnd);

  if (daysUntilReset === 0) {
    return null;
  }

  const isFallingBackToWorkspaceCredits =
    currentWorkspace?.billingCustomer?.userCreditsFallback !==
    UserCreditsFallback.STOP;

  return (
    <AiChatInlineBanner
      status={isFallingBackToWorkspaceCredits ? 'info' : 'error'}
      action={
        <InlineBanner.Action
          onClick={() =>
            setAgentChatUserCreditsBannerDismissedPeriodEnd(
              userCreditsUsage.periodEnd,
            )
          }
        >{t`Dismiss`}</InlineBanner.Action>
      }
    >
      {isFallingBackToWorkspaceCredits
        ? t`You have used all your AI credits. Chats use workspace credits until yours renew in ${plural(daysUntilReset, { one: '# day', other: '# days' })}.`
        : t`You have used all your AI credits. Chats stop until yours renew in ${plural(daysUntilReset, { one: '# day', other: '# days' })}.`}
    </AiChatInlineBanner>
  );
};
