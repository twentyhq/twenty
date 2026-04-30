import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { QuotaData } from '../types/sales.types';
import { GET_SALES_EXECUTION_DATA } from '../hooks/useSalesExecution';

const StyledContainer = styled.div` display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[3]}; `;
const StyledTitle = styled.h2` font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0; `;
const StyledRow = styled.div` display: flex; align-items: center; gap: ${themeCssVariables.spacing[3]}; @media (max-width: ${MOBILE_VIEWPORT}px) { flex-direction: column; align-items: flex-start; } `;
const StyledRepName = styled.span` font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; min-width: 120px; `;
const StyledBarContainer = styled.div` flex: 1; height: 24px; background: ${themeCssVariables.background.transparent.lighter}; border-radius: 4px; overflow: hidden; position: relative; min-width: 200px; `;
const StyledBarFill = styled.div<{ percentage: number; isOver: boolean }>` height: 100%; width: ${({ percentage }) => Math.min(percentage, 100)}%; background: ${({ isOver }) => isOver ? themeCssVariables.color.green : themeCssVariables.color.blue}; border-radius: 4px; transition: width 0.3s ease; `;
const StyledPercentage = styled.span<{ isOver: boolean }>` font-size: ${themeCssVariables.font.size.sm}; font-weight: ${themeCssVariables.font.weight.medium}; color: ${({ isOver }) => isOver ? themeCssVariables.color.green : themeCssVariables.font.color.secondary}; min-width: 50px; text-align: right; `;

export const QuotaTracker = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_SALES_EXECUTION_DATA);
  if (loading) return <StyledContainer>{t`Loading...`}</StyledContainer>;
  if (error) return <StyledContainer>{t`Error loading data`}</StyledContainer>;
  const quotas: QuotaData[] = data?.salesexecutionData?.quotas ?? [];
  return (
    <StyledContainer>
      <StyledTitle>{t`Quota Tracker`}</StyledTitle>
      {quotas.map((quota) => {
        const percentage = quota.quota > 0 ? Math.round((quota.actual / quota.quota) * 100) : 0;
        const isOver = percentage >= 100;
        return (
          <StyledRow key={quota.repName}>
            <StyledRepName>{quota.repName}</StyledRepName>
            <StyledBarContainer><StyledBarFill percentage={percentage} isOver={isOver} /></StyledBarContainer>
            <StyledPercentage isOver={isOver}>{percentage}%</StyledPercentage>
          </StyledRow>
        );
      })}
    </StyledContainer>
  );
};
