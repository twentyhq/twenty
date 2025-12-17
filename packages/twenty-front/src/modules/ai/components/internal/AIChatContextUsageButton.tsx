import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { ProgressBar } from 'twenty-ui/feedback';

import { ContextUsageProgressRing } from '@/ai/components/internal/ContextUsageProgressRing';
import { agentChatUsageState } from '@/ai/states/agentChatUsageState';

const StyledContainer = styled.div`
  position: relative;
`;

const StyledTrigger = styled.div<{ hasUsage: boolean }>`
  align-items: center;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.background.transparent.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: ${({ hasUsage }) => (hasUsage ? 'pointer' : 'default')};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  height: 24px;
  padding: 0 ${({ theme }) => theme.spacing(2)};
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
  min-width: 240px;
  position: absolute;
  right: 0;
  bottom: calc(100% + 8px);
  z-index: ${({ theme }) => theme.lastLayerZIndex};
`;

const StyledHeader = styled.div`
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

const StyledBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)};
  padding-top: 0;
`;

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledValue = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledFooter = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.secondary};
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: 0 0 ${({ theme }) => theme.border.radius.md}
    ${({ theme }) => theme.border.radius.md};
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(3)};
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
          <StyledPercentage>0%</StyledPercentage>
        </StyledTrigger>
      </StyledContainer>
    );
  }

  const percentage = Math.min(
    (agentChatUsage.totalTokens / agentChatUsage.contextWindowTokens) * 100,
    100,
  );
  const formattedPercentage = percentage.toFixed(1);
  const totalCredits =
    agentChatUsage.inputCredits + agentChatUsage.outputCredits;
  const inputCredits = agentChatUsage.inputCredits.toLocaleString();
  const outputCredits = agentChatUsage.outputCredits.toLocaleString();

  return (
    <StyledContainer
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <StyledTrigger hasUsage={true}>
        <ContextUsageProgressRing percentage={percentage} />
        <StyledPercentage>{formattedPercentage}%</StyledPercentage>
      </StyledTrigger>

      {isHovered && (
        <StyledHoverCard>
          <StyledHeader>
            <StyledRow>
              <StyledPercentage>{formattedPercentage}%</StyledPercentage>
              <StyledValue>
                {formatTokenCount(agentChatUsage.totalTokens)} /{' '}
                {formatTokenCount(agentChatUsage.contextWindowTokens)}
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
          </StyledHeader>

          <StyledBody>
            <StyledRow>
              <StyledLabel>{t`Input`}</StyledLabel>
              <StyledValue>
                {formatTokenCount(agentChatUsage.inputTokens)} •{' '}
                {t`${inputCredits} credits`}
              </StyledValue>
            </StyledRow>
            <StyledRow>
              <StyledLabel>{t`Output`}</StyledLabel>
              <StyledValue>
                {formatTokenCount(agentChatUsage.outputTokens)} •{' '}
                {t`${outputCredits} credits`}
              </StyledValue>
            </StyledRow>
          </StyledBody>

          <StyledFooter>
            <StyledLabel>{t`Total credits`}</StyledLabel>
            <StyledPercentage>{totalCredits.toLocaleString()}</StyledPercentage>
          </StyledFooter>
        </StyledHoverCard>
      )}
    </StyledContainer>
  );
};
