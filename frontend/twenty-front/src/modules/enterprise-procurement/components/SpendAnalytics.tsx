import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { SpendCategory } from '../types/procurement.types';
import { GET_SPEND_BY_CATEGORY } from '../hooks/useProcurement';

const BAR_COLORS = [
  themeCssVariables.color.blue, themeCssVariables.color.turquoise,
  themeCssVariables.color.yellow, themeCssVariables.color.orange,
  themeCssVariables.color.red, themeCssVariables.color.gray50,
];

const StyledContainer = styled.div`
  display: flex; flex-direction: column;
  padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[3]};
`;
const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0;
`;
const StyledTotal = styled.span`
  font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.secondary};
`;
const StyledList = styled.div`
  display: flex; flex-direction: column; gap: ${themeCssVariables.spacing[2]};
`;
const StyledRow = styled.div`
  display: flex; align-items: center; gap: ${themeCssVariables.spacing[3]};
  @media (max-width: ${MOBILE_VIEWPORT}px) { flex-direction: column; align-items: flex-start; gap: ${themeCssVariables.spacing[1]}; }
`;
const StyledCategory = styled.span`
  font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; min-width: 160px;
`;
const StyledBarContainer = styled.div`
  flex: 1; height: 20px; background: ${themeCssVariables.background.transparent.lighter};
  border-radius: 4px; overflow: hidden; min-width: 200px;
`;
const StyledBar = styled.div<{ width: number; color: string }>`
  height: 100%; width: ${({ width }) => width}%; background: ${({ color }) => color}; border-radius: 4px;
`;
const StyledAmount = styled.span`
  font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.secondary};
  min-width: 120px; text-align: right;
`;
const StyledPercent = styled.span`
  font-size: ${themeCssVariables.font.size.sm}; font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary}; min-width: 40px; text-align: right;
`;

export const SpendAnalytics = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_SPEND_BY_CATEGORY);

  if (loading) return <StyledContainer>{t`Loading...`}</StyledContainer>;
  if (error) return <StyledContainer>{t`Error loading data`}</StyledContainer>;

  const categories: SpendCategory[] = data?.spendByCategory?.categories ?? [];
  const totalSpend = data?.spendByCategory?.totalSpend ?? categories.reduce((sum, cat) => sum + cat.amount, 0);

  return (
    <StyledContainer>
      <StyledTitle>{t`Spend Analytics`}</StyledTitle>
      <StyledTotal>{t`Total Spend`}: ${totalSpend.toLocaleString()} COP</StyledTotal>
      <StyledList>
        {categories.map((cat, index) => (
          <StyledRow key={cat.category}>
            <StyledCategory>{cat.category}</StyledCategory>
            <StyledBarContainer>
              <StyledBar width={cat.percentage} color={BAR_COLORS[index % BAR_COLORS.length]} />
            </StyledBarContainer>
            <StyledAmount>${cat.amount.toLocaleString()}</StyledAmount>
            <StyledPercent>{cat.percentage}%</StyledPercent>
          </StyledRow>
        ))}
      </StyledList>
    </StyledContainer>
  );
};
