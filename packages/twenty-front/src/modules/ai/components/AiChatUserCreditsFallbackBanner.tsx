import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { Button } from 'twenty-ui/primitives/input';

import { agentChatUserCreditsFallbackNoticeState } from '@/ai/states/agentChatUserCreditsFallbackNoticeState';
import { computeDaysUntilReset } from '@/ai/utils/computeDaysUntilReset';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

export const AiChatUserCreditsFallbackBanner = () => {
  const { t } = useLingui();

  const [
    agentChatUserCreditsFallbackNotice,
    setAgentChatUserCreditsFallbackNotice,
  ] = useAtomState(agentChatUserCreditsFallbackNoticeState);

  if (!isDefined(agentChatUserCreditsFallbackNotice)) {
    return null;
  }

  const daysUntilReset = computeDaysUntilReset(
    agentChatUserCreditsFallbackNotice.renewsAt,
  );

  return (
    <InlineBanner
      embedded
      status="info"
      action={
        <Button
          size="sm"
          variant="outline"
          onClick={() => setAgentChatUserCreditsFallbackNotice(null)}
        >{t`Dismiss`}</Button>
      }
    >
      {t`You have used all your AI credits. Chats use workspace credits until yours renew in ${plural(daysUntilReset, { one: '# day', other: '# days' })}.`}
    </InlineBanner>
  );
};
