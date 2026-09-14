import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { HorizontalSeparator } from 'twenty-ui/layout';
import { IconArrowUp, IconArrowDown, IconCurrencyDollar } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { agentChatUsageComponentFamilyState } from '@/ai/states/agentChatUsageComponentFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { billingState } from '@/client-config/states/billingState';
import { UsageProgressRow } from '@/ui/feedback/progress-ring/components/UsageProgressRow';
import { useUsageValueFormatter } from '@/settings/usage/hooks/useUsageValueFormatter';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { formatNumber } from '~/utils/format/formatNumber';

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledSectionTitle = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  height: 20px;
`;

export const AiChatContextUsageDetails = () => {
  const { t } = useLingui();
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const agentChatUsage = useAtomComponentFamilyStateValue(
    agentChatUsageComponentFamilyState,
    { threadId: currentAiChatThread },
  );
  const billing = useAtomStateValue(billingState);
  const isBillingEnabled = billing?.isBillingEnabled ?? false;
  const { formatUsageValue } = useUsageValueFormatter();

  // Values from the streaming API arrive as display credits (micro-credits).
  const formatChatCost = (displayCredits: number): string => {
    if (isBillingEnabled) {
      return `${formatUsageValue(displayCredits)}`;
    }
    const dollars = displayCredits / 1000;

    return `$${formatNumber(dollars, { decimals: 2 })}`;
  };

  if (!agentChatUsage) return null;

  const formatTokens = (tokens: number) => {
    const amount = formatNumber(tokens, { abbreviate: true, decimals: 1 });
    if (agentChatUsage.contextWindowTokens <= 0) return amount;
    const percentage = formatNumber(
      (tokens / agentChatUsage.contextWindowTokens) * 100,
      { decimals: 1 },
    );
    return `${amount} (${percentage}%)`;
  };
  const lastMessage = agentChatUsage.lastMessage;
  const cachedLabel =
    isDefined(lastMessage) && lastMessage.inputTokens > 0
      ? t`${Math.round((lastMessage.cachedInputTokens / lastMessage.inputTokens) * 100)}% cached`
      : undefined;

  return (
    <>
      {isDefined(lastMessage) && (
        <>
          <HorizontalSeparator noMargin />
          <StyledSection>
            <StyledSectionTitle>{t`Last message`}</StyledSectionTitle>
            <UsageProgressRow
              Icon={IconArrowUp}
              label={t`Input tokens`}
              value={null}
              valueLabel={
                <span title={cachedLabel}>
                  {formatTokens(lastMessage.inputTokens)}
                </span>
              }
            />
            <UsageProgressRow
              Icon={IconArrowDown}
              label={t`Output tokens`}
              value={null}
              valueLabel={formatTokens(lastMessage.outputTokens)}
            />
            <UsageProgressRow
              Icon={IconCurrencyDollar}
              label={t`Cost index`}
              value={null}
              valueLabel={formatChatCost(
                lastMessage.inputCredits + lastMessage.outputCredits,
              )}
            />
          </StyledSection>
        </>
      )}
      <HorizontalSeparator noMargin />
      <StyledSection>
        <StyledSectionTitle>{t`Conversation`}</StyledSectionTitle>
        <UsageProgressRow
          Icon={IconArrowUp}
          label={t`Input tokens`}
          value={null}
          valueLabel={formatTokens(agentChatUsage.inputTokens)}
        />
        <UsageProgressRow
          Icon={IconArrowDown}
          label={t`Output tokens`}
          value={null}
          valueLabel={formatTokens(agentChatUsage.outputTokens)}
        />
        <UsageProgressRow
          Icon={IconCurrencyDollar}
          label={t`Cost index`}
          value={null}
          valueLabel={formatChatCost(
            agentChatUsage.inputCredits + agentChatUsage.outputCredits,
          )}
        />
      </StyledSection>
    </>
  );
};
