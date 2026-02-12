import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { ProgressBar } from 'twenty-ui/feedback';

import { ContextUsageProgressRing } from '@/ai/components/internal/ContextUsageProgressRing';
import {
  agentChatUsageState,
  type AgentChatLastMessageUsage,
} from '@/ai/states/agentChatUsageState';

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
  transition: background 0.1s ease;

  &:hover {
    background: ${({ theme, hasUsage }) =>
      hasUsage ? theme.background.transparent.light : 'transparent'};
  }
`;

const StyledPercentage = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledHoverCard = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  min-width: 280px;
  position: absolute;
  right: 0;
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

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledValue = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledSectionTitle = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StyledDivider = styled.div`
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
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
  const agentChatUsage = useRecoilValue(agentChatUsageState);

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
            <StyledRow>
              <StyledPercentage>{formattedPercentage}%</StyledPercentage>
              <StyledValue>
                {formatTokenCount(agentChatUsage.conversationSize)} /{' '}
                {formatTokenCount(agentChatUsage.contextWindowTokens)}{' '}
                {t`tokens`}
              </StyledValue>
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
              backgroundColor={theme.background.quaternary}
              withBorderRadius
            />
          </StyledSection>

          {isDefined(lastMessage) && (
            <>
              <StyledDivider />
              <StyledSection>
                <StyledSectionTitle>{t`Last message`}</StyledSectionTitle>
                <StyledRow>
                  <StyledLabel>{t`Input tokens`}</StyledLabel>
                  <StyledValue>
                    {formatTokenCount(lastMessage.inputTokens)}
                    {getCachedLabel(lastMessage)}
                  </StyledValue>
                </StyledRow>
                <StyledRow>
                  <StyledLabel>{t`Output tokens`}</StyledLabel>
                  <StyledValue>
                    {formatTokenCount(lastMessage.outputTokens)}
                  </StyledValue>
                </StyledRow>
                <StyledRow>
                  <StyledLabel>{t`Cost`}</StyledLabel>
                  <StyledValue>
                    {formatCredits(
                      lastMessage.inputCredits + lastMessage.outputCredits,
                    )}{' '}
                    {t`credits`}
                  </StyledValue>
                </StyledRow>
              </StyledSection>
            </>
          )}

          <StyledDivider />
          <StyledSection>
            <StyledSectionTitle>{t`Conversation`}</StyledSectionTitle>
            <StyledRow>
              <StyledLabel>{t`Input tokens`}</StyledLabel>
              <StyledValue>
                {formatTokenCount(agentChatUsage.inputTokens)}
              </StyledValue>
            </StyledRow>
            <StyledRow>
              <StyledLabel>{t`Output tokens`}</StyledLabel>
              <StyledValue>
                {formatTokenCount(agentChatUsage.outputTokens)}
              </StyledValue>
            </StyledRow>
            <StyledRow>
              <StyledLabel>{t`Total cost`}</StyledLabel>
              <StyledValue>
                {formatCredits(totalCredits)} {t`credits`}
              </StyledValue>
            </StyledRow>
          </StyledSection>
        </StyledHoverCard>
      )}
    </StyledContainer>
  );
};
