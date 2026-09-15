import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { HorizontalSeparator } from 'twenty-ui/layout';
import { IconArrowUp, IconArrowDown, IconCoins } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { agentChatUsageComponentFamilyState } from '@/ai/states/agentChatUsageComponentFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { UsageProgressRow } from '@/ui/feedback/progress-ring/components/UsageProgressRow';
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
              Icon={IconCoins}
              label={t`Credits`}
              value={null}
              valueLabel={formatNumber(
                lastMessage.inputCredits + lastMessage.outputCredits,
                { decimals: 3 },
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
          Icon={IconCoins}
          label={t`Credits`}
          value={null}
          valueLabel={formatNumber(
            agentChatUsage.inputCredits + agentChatUsage.outputCredits,
            { decimals: 3 },
          )}
        />
      </StyledSection>
    </>
  );
};
