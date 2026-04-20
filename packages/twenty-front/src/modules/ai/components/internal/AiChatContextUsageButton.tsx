import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { HorizontalSeparator } from 'twenty-ui/display';
import { ProgressBar } from 'twenty-ui/feedback';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ContextUsageProgressRing } from '@/ai/components/internal/ContextUsageProgressRing';
import { agentChatHasMessageComponentSelector } from '@/ai/states/agentChatHasMessageComponentSelector';
import {
  agentChatUsageComponentFamilyState,
  type AgentChatLastMessageUsage,
} from '@/ai/states/agentChatUsageComponentFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { SettingsBillingLabelValueItem } from '@/settings/billing/components/internal/SettingsBillingLabelValueItem';
import { billingState } from '@/client-config/states/billingState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { formatNumber } from '~/utils/format/formatNumber';

const StyledContainer = styled.div`
  position: relative;
`;

const StyledTrigger = styled.div<{ hasUsage: boolean }>`
  align-items: center;
  cursor: ${({ hasUsage }) => (hasUsage ? 'pointer' : 'default')};
  display: flex;
  height: 24px;
  justify-content: center;
  min-width: 24px;
  transition: background calc(${themeCssVariables.animation.duration.fast} * 1s)
    ease;

  &:hover {
    background: ${({ hasUsage }) =>
      hasUsage
        ? themeCssVariables.background.transparent.light
        : 'transparent'};
  }
`;

const StyledHoverCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  bottom: calc(100% + 8px);
  box-shadow: ${themeCssVariables.boxShadow.strong};
  left: 0;
  min-width: 280px;
  position: absolute;
  z-index: ${themeCssVariables.lastLayerZIndex};
`;

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const StyledContextWindowValue = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledSectionTitle = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

const getCachedLabel = (lastMessage: AgentChatLastMessageUsage): string => {
  if (lastMessage.cachedInputTokens <= 0 || lastMessage.inputTokens <= 0) {
    return '';
  }

  const cachedPercent = Math.round(
    (lastMessage.cachedInputTokens / lastMessage.inputTokens) * 100,
  );

  return ` (${t`${cachedPercent}% cached`})`;
};

export const AiChatContextUsageButton = () => {
  const { t } = useLingui();
  const [isHovered, setIsHovered] = useState(false);
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const agentChatUsage = useAtomComponentFamilyStateValue(
    agentChatUsageComponentFamilyState,
    { threadId: currentAiChatThread },
  );
  const billing = useAtomStateValue(billingState);
  const isBillingEnabled = billing?.isBillingEnabled ?? false;

  // Values from the streaming API arrive as display credits (micro-credits / 1000).
  // 1000 display credits = $1. Convert accordingly.
  const formatChatCost = (displayCredits: number): string => {
    if (isBillingEnabled) {
      return `${formatNumber(displayCredits, { decimals: 1 })} credits`;
    }
    const dollars = displayCredits / 1000;

    return `$${formatNumber(dollars, { decimals: 2 })}`;
  };

  const hasMessages = useAtomComponentSelectorValue(
    agentChatHasMessageComponentSelector,
  );

  if (!hasMessages) {
    return null;
  }

  if (!agentChatUsage) {
    return (
      <StyledContainer>
        <StyledTrigger hasUsage={false}>
          <ContextUsageProgressRing percentage={0} />
        </StyledTrigger>
      </StyledContainer>
    );
  }

  const percentage = Math.min(
    (agentChatUsage.conversationSize / agentChatUsage.contextWindowTokens) *
      100,
    100,
  );
  const formattedPercentage = percentage.toFixed(1);
  const totalCredits =
    agentChatUsage.inputCredits + agentChatUsage.outputCredits;
  const lastMessage = agentChatUsage.lastMessage;

  return (
    <StyledContainer
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <StyledTrigger hasUsage={true}>
        <ContextUsageProgressRing percentage={percentage} />
      </StyledTrigger>

      {isHovered && (
        <StyledHoverCard>
          <StyledSection>
            <StyledSectionTitle>{t`Context window`}</StyledSectionTitle>
            <StyledRow>
              <StyledContextWindowValue>
                {formattedPercentage}%
              </StyledContextWindowValue>
              <StyledContextWindowValue>
                {formatNumber(agentChatUsage.conversationSize, {
                  abbreviate: true,
                  decimals: 1,
                })}{' '}
                /{' '}
                {formatNumber(agentChatUsage.contextWindowTokens, {
                  abbreviate: true,
                  decimals: 1,
                })}{' '}
                {t`tokens`}
              </StyledContextWindowValue>
            </StyledRow>
            <ProgressBar
              value={percentage}
              barColor={
                percentage > 80
                  ? themeCssVariables.color.red
                  : percentage > 60
                    ? themeCssVariables.color.orange
                    : themeCssVariables.color.blue
              }
              backgroundColor={themeCssVariables.background.tertiary}
              withBorderRadius
            />
          </StyledSection>

          {isDefined(lastMessage) && (
            <>
              <HorizontalSeparator
                noMargin
                color={themeCssVariables.background.tertiary}
              />
              <StyledSection>
                <StyledSectionTitle>{t`Last message`}</StyledSectionTitle>
                <SettingsBillingLabelValueItem
                  label={t`Input tokens`}
                  value={`${formatNumber(lastMessage.inputTokens, {
                    abbreviate: true,
                    decimals: 1,
                  })}${getCachedLabel(lastMessage)}`}
                />
                <SettingsBillingLabelValueItem
                  label={t`Output tokens`}
                  value={formatNumber(lastMessage.outputTokens, {
                    abbreviate: true,
                    decimals: 1,
                  })}
                />
                <SettingsBillingLabelValueItem
                  label={t`Cost`}
                  value={formatChatCost(
                    lastMessage.inputCredits + lastMessage.outputCredits,
                  )}
                />
              </StyledSection>
            </>
          )}

          <HorizontalSeparator
            noMargin
            color={themeCssVariables.background.tertiary}
          />
          <StyledSection>
            <StyledSectionTitle>{t`Conversation`}</StyledSectionTitle>
            <SettingsBillingLabelValueItem
              label={t`Input tokens`}
              value={formatNumber(agentChatUsage.inputTokens, {
                abbreviate: true,
                decimals: 1,
              })}
            />
            <SettingsBillingLabelValueItem
              label={t`Output tokens`}
              value={formatNumber(agentChatUsage.outputTokens, {
                abbreviate: true,
                decimals: 1,
              })}
            />
            <SettingsBillingLabelValueItem
              label={t`Total cost`}
              value={formatChatCost(totalCredits)}
            />
          </StyledSection>
        </StyledHoverCard>
      )}
    </StyledContainer>
  );
};
