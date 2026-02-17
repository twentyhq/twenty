import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { HorizontalSeparator } from 'twenty-ui/display';
import { ProgressBar } from 'twenty-ui/feedback';

import { ContextUsageProgressRing } from '@/ai/components/internal/ContextUsageProgressRing';
import { SettingsBillingLabelValueItem } from '@/billing/components/internal/SettingsBillingLabelValueItem';
import {
  agentChatUsageStateV2,
  type AgentChatLastMessageUsage,
} from '@/ai/states/agentChatUsageStateV2';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

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
  transition: background ${({ theme }) => theme.animation.duration.fast}s ease;

  &:hover {
    background: ${({ theme, hasUsage }) =>
      hasUsage ? theme.background.transparent.light : 'transparent'};
  }
`;

const StyledHoverCard = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  min-width: 280px;
  position: absolute;
  left: 0;
  bottom: calc(100% + 8px);
  z-index: ${({ theme }) => theme.lastLayerZIndex};
`;

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const StyledContextWindowValue = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledSectionTitle = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  padding-bottom: ${({ theme }) => theme.spacing(2)};
`;

const formatTokenCount = (count: number): string => {
  if (count >= 1_000_000_000) {
    return `${(count / 1_000_000_000).toFixed(1)}B`;
  }
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K`;
  }
  return count.toString();
};

const formatCredits = (credits: number): string => {
  // Credits are already in display units from the API (internal / 1000)
  // Show up to 1 decimal for fractional values, none for whole numbers
  if (Number.isInteger(credits)) {
    return credits.toLocaleString();
  }

  return credits.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });
};

const getCachedLabel = (lastMessage: AgentChatLastMessageUsage): string => {
  if (lastMessage.cachedInputTokens <= 0 || lastMessage.inputTokens <= 0) {
    return '';
  }

  const cachedPercent = Math.round(
    (lastMessage.cachedInputTokens / lastMessage.inputTokens) * 100,
  );

  return ` (${t`${cachedPercent}% cached`})`;
};

export const AIChatContextUsageButton = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const agentChatUsage = useRecoilValueV2(agentChatUsageStateV2);

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
                {formatTokenCount(agentChatUsage.conversationSize)} /{' '}
                {formatTokenCount(agentChatUsage.contextWindowTokens)}{' '}
                {t`tokens`}
              </StyledContextWindowValue>
            </StyledRow>
            <ProgressBar
              value={percentage}
              barColor={
                percentage > 80
                  ? theme.color.red
                  : percentage > 60
                    ? theme.color.orange
                    : theme.color.blue
              }
              backgroundColor={theme.background.tertiary}
              withBorderRadius
            />
          </StyledSection>

          {isDefined(lastMessage) && (
            <>
              <HorizontalSeparator noMargin color={theme.background.tertiary} />
              <StyledSection>
                <StyledSectionTitle>{t`Last message`}</StyledSectionTitle>
                <SettingsBillingLabelValueItem
                  label={t`Input tokens`}
                  value={`${formatTokenCount(lastMessage.inputTokens)}${getCachedLabel(lastMessage)}`}
                />
                <SettingsBillingLabelValueItem
                  label={t`Output tokens`}
                  value={formatTokenCount(lastMessage.outputTokens)}
                />
                <SettingsBillingLabelValueItem
                  label={t`Cost`}
                  value={`${formatCredits(lastMessage.inputCredits + lastMessage.outputCredits)} ${t`credits`}`}
                />
              </StyledSection>
            </>
          )}

          <HorizontalSeparator noMargin color={theme.background.tertiary} />
          <StyledSection>
            <StyledSectionTitle>{t`Conversation`}</StyledSectionTitle>
            <SettingsBillingLabelValueItem
              label={t`Input tokens`}
              value={formatTokenCount(agentChatUsage.inputTokens)}
            />
            <SettingsBillingLabelValueItem
              label={t`Output tokens`}
              value={formatTokenCount(agentChatUsage.outputTokens)}
            />
            <SettingsBillingLabelValueItem
              label={t`Total cost`}
              value={`${formatCredits(totalCredits)} ${t`credits`}`}
            />
          </StyledSection>
        </StyledHoverCard>
      )}
    </StyledContainer>
  );
};
