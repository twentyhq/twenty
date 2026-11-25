import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { formatAiChatTokens } from '@/ai-chat/usage/utils/formatAiChatTokens';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { MetricRow } from 'twenty-ui/components/data-display';
import { Separator } from 'twenty-ui/primitives/layout';
import {
  IconArrowUp,
  IconArrowDown,
  IconCoins,
  IconHistory,
} from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

import { AiChatContextCardSection } from '@/ai-chat/usage/components/AiChatContextCardSection';
import { aiChatThreadUsageFamilySelector } from '@/ai-chat/usage/states/selectors/aiChatThreadUsageFamilySelector';
import { formatNumber } from '@/localization/utils/formatNumber';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

export const AiChatContextUsageDetails = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const { threadId } = useAiChatInstanceOrThrow();
  const aiChatThreadUsage = useAtomFamilySelectorValue(
    aiChatThreadUsageFamilySelector,
    {
      threadId,
    },
  );
  if (!isDefined(aiChatThreadUsage)) {
    return null;
  }

  const lastMessage = aiChatThreadUsage.lastMessage;

  return (
    <>
      {isDefined(lastMessage) && (
        <>
          <Separator />
          <AiChatContextCardSection title={t`Last message`}>
            <MetricRow
              startIcon={<IconArrowUp size={theme.icon.size.sm} />}
              value={formatAiChatTokens(lastMessage.inputTokens)}
            >
              {t`Input tokens`}
            </MetricRow>
            <MetricRow
              startIcon={<IconHistory size={theme.icon.size.sm} />}
              value={formatAiChatTokens(lastMessage.cachedInputTokens)}
            >
              {t`Cached input`}
            </MetricRow>
            <MetricRow
              startIcon={<IconArrowDown size={theme.icon.size.sm} />}
              value={formatAiChatTokens(lastMessage.outputTokens)}
            >
              {t`Output tokens`}
            </MetricRow>
            <MetricRow
              startIcon={<IconCoins size={theme.icon.size.sm} />}
              value={formatNumber(
                lastMessage.inputCredits + lastMessage.outputCredits,
                { decimals: 3 },
              )}
            >
              {t`Credits`}
            </MetricRow>
          </AiChatContextCardSection>
        </>
      )}
      <Separator />
      <AiChatContextCardSection title={t`Conversation`}>
        <MetricRow
          startIcon={<IconArrowUp size={theme.icon.size.sm} />}
          value={formatAiChatTokens(aiChatThreadUsage.inputTokens)}
        >
          {t`Input tokens`}
        </MetricRow>
        <MetricRow
          startIcon={<IconHistory size={theme.icon.size.sm} />}
          value={formatAiChatTokens(aiChatThreadUsage.cachedInputTokens)}
        >
          {t`Cached input`}
        </MetricRow>
        <MetricRow
          startIcon={<IconArrowDown size={theme.icon.size.sm} />}
          value={formatAiChatTokens(aiChatThreadUsage.outputTokens)}
        >
          {t`Output tokens`}
        </MetricRow>
        <MetricRow
          startIcon={<IconCoins size={theme.icon.size.sm} />}
          value={formatNumber(
            aiChatThreadUsage.inputCredits + aiChatThreadUsage.outputCredits,
            { decimals: 3 },
          )}
        >
          {t`Credits`}
        </MetricRow>
      </AiChatContextCardSection>
    </>
  );
};
