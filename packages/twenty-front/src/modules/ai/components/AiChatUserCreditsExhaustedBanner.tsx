import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';

import { AiChatInlineBanner } from '@/ai/components/AiChatInlineBanner';
import { useAiChatUserCreditsUsage } from '@/ai/hooks/useAiChatUserCreditsUsage';
import { useIsWorkspaceSetupChat } from '@/ai/hooks/useIsWorkspaceSetupChat';
import { agentChatUserCreditsBannerDismissalState } from '@/ai/states/agentChatUserCreditsBannerDismissalState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

export const AiChatUserCreditsExhaustedBanner = () => {
  const { t } = useLingui();

  const isWorkspaceSetupChat = useIsWorkspaceSetupChat();

  const [
    agentChatUserCreditsBannerDismissal,
    setAgentChatUserCreditsBannerDismissal,
  ] = useAtomState(agentChatUserCreditsBannerDismissalState);

  const { userCreditsUsage } = useAiChatUserCreditsUsage({
    skip: isWorkspaceSetupChat,
  });

  if (!isDefined(userCreditsUsage) || !userCreditsUsage.isExhausted) {
    return null;
  }

  const { periodEnd, daysUntilReset, isFallingBackToWorkspaceCredits } =
    userCreditsUsage;

  if (
    agentChatUserCreditsBannerDismissal?.periodEnd === periodEnd &&
    agentChatUserCreditsBannerDismissal.isFallingBackToWorkspaceCredits ===
      isFallingBackToWorkspaceCredits
  ) {
    return null;
  }

  return (
    <AiChatInlineBanner
      status={isFallingBackToWorkspaceCredits ? 'info' : 'error'}
      action={
        <InlineBanner.Action
          onClick={() =>
            setAgentChatUserCreditsBannerDismissal({
              periodEnd,
              isFallingBackToWorkspaceCredits,
            })
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
