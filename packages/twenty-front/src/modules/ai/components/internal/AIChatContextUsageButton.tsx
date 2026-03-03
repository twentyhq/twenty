import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { useContext, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { HorizontalSeparator } from 'twenty-ui/display';
import { ProgressBar } from 'twenty-ui/feedback';
import { ThemeContext } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ContextUsageProgressRing } from '@/ai/components/internal/ContextUsageProgressRing';
import { SettingsBillingLabelValueItem } from '@/billing/components/internal/SettingsBillingLabelValueItem';
import {
  agentChatUsageState,
  type AgentChatLastMessageUsage,
} from '@/ai/states/agentChatUsageState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

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
  box-shadow: ${themeCssVariables.boxShadow.strong};
  min-width: 280px;
  position: absolute;
  left: 0;
  bottom: calc(100% + 8px);
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
  const { theme } = useContext(ThemeContext);
  const [isHovered, setIsHovered] = useState(false);
  const agentChatUsage = useAtomStateValue(agentChatUsageState);

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
