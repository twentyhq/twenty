import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';

import { AiChatInlineBanner } from '@/ai/components/AiChatInlineBanner';
import { useAiChatUserCreditsUsage } from '@/ai/hooks/useAiChatUserCreditsUsage';
import { useIsWorkspaceSetupChat } from '@/ai/hooks/useIsWorkspaceSetupChat';
import { agentChatUserCreditsBannerDismissedPeriodEndState } from '@/ai/states/agentChatUserCreditsBannerDismissedPeriodEndState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

export const AiChatUserCreditsExhaustedBanner = () => {
  const { t } = useLingui();

  const isWorkspaceSetupChat = useIsWorkspaceSetupChat();

  const [
    agentChatUserCreditsBannerDismissedPeriodEnd,
    setAgentChatUserCreditsBannerDismissedPeriodEnd,
  ] = useAtomState(agentChatUserCreditsBannerDismissedPeriodEndState);

  const { userCreditsUsage } = useAiChatUserCreditsUsage({
    skip: isWorkspaceSetupChat,
  });

  if (
    !isDefined(userCreditsUsage) ||
    !userCreditsUsage.isExhausted ||
    userCreditsUsage.periodEnd === agentChatUserCreditsBannerDismissedPeriodEnd
  ) {
    return null;
  }

  const { daysUntilReset, isFallingBackToWorkspaceCredits } = userCreditsUsage;

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
        ? t`Personal usage limit reached. Using workspace credits until it resets in ${plural(daysUntilReset, { one: '# day', other: '# days' })}.`
        : t`Personal usage limit reached. Chats resume in ${plural(daysUntilReset, { one: '# day', other: '# days' })}.`}
    </AiChatInlineBanner>
  );
};
