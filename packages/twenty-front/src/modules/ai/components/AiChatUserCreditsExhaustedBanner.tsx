import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';

import { agentChatUserCreditsExhaustedNoticeState } from '@/ai/states/agentChatUserCreditsExhaustedNoticeState';
import { computeDaysUntilReset } from '@/ai/utils/computeDaysUntilReset';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

export const AiChatUserCreditsExhaustedBanner = () => {
  const { t } = useLingui();

  const [
    agentChatUserCreditsExhaustedNotice,
    setAgentChatUserCreditsExhaustedNotice,
  ] = useAtomState(agentChatUserCreditsExhaustedNoticeState);

  if (!isDefined(agentChatUserCreditsExhaustedNotice)) {
    return null;
  }

  const daysUntilReset = computeDaysUntilReset(
    agentChatUserCreditsExhaustedNotice.renewsAt,
  );

  if (daysUntilReset === 0) {
    return null;
  }

  return (
    <InlineBanner
      embedded
      status="info"
      action={
        <InlineBanner.Action
          onClick={() => setAgentChatUserCreditsExhaustedNotice(null)}
        >{t`Dismiss`}</InlineBanner.Action>
      }
    >
      {agentChatUserCreditsExhaustedNotice.isFallingBackToWorkspaceCredits
        ? t`You have used all your AI credits. Chats use workspace credits until yours renew in ${plural(daysUntilReset, { one: '# day', other: '# days' })}.`
        : t`You have used all your AI credits. Chats stop until yours renew in ${plural(daysUntilReset, { one: '# day', other: '# days' })}.`}
    </InlineBanner>
  );
};
