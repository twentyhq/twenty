import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { AccountTier, TargetAccountData } from '../types/abm.types';
import { GET_ABM_DATA } from '../hooks/useABM';

const TIER_COLORS: Record<AccountTier, string> = { tier_1: themeCssVariables.color.blue, tier_2: themeCssVariables.color.orange, tier_3: themeCssVariables.color.gray50 };
const StyledContainer = styled.div` display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[2]}; `;
const StyledTitle = styled.h2` font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0; `;
const StyledTable = styled.table` width: 100%; border-collapse: collapse; `;
const StyledTh = styled.th` text-align: left; padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary}; border-bottom: 1px solid ${themeCssVariables.border.color.medium}; `;
const StyledTd = styled.td` padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light}; `;
const StyledBadge = styled.span<{ color: string }>` padding: 2px 8px; border-radius: 4px; font-size: ${themeCssVariables.font.size.xs}; font-weight: ${themeCssVariables.font.weight.medium}; background: ${({ color }) => color}; color: ${themeCssVariables.font.color.inverted}; `;
const StyledRH = styled.td` padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light}; @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; } `;
const StyledRHH = styled.th` text-align: left; padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary}; border-bottom: 1px solid ${themeCssVariables.border.color.medium}; @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; } `;

export const TargetAccountList = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_ABM_DATA);
  if (loading) return <StyledContainer>{t`Loading...`}</StyledContainer>;
  if (error) return <StyledContainer>{t`Error loading data`}</StyledContainer>;
  const accounts: TargetAccountData[] = data?.abmData?.accounts ?? [];
  return (
    <StyledContainer>
      <StyledTitle>{t`Target Accounts`}</StyledTitle>
      <StyledTable>
        <thead><tr><StyledTh>{t`Account`}</StyledTh><StyledTh>{t`Tier`}</StyledTh><StyledTh>{t`Owner`}</StyledTh><StyledRHH>{t`Industry`}</StyledRHH><StyledRHH>{t`Engagement`}</StyledRHH><StyledRHH>{t`Pipeline`}</StyledRHH></tr></thead>
        <tbody>{accounts.map((a) => (<tr key={a.id}><StyledTd>{a.accountName}</StyledTd><StyledTd><StyledBadge color={TIER_COLORS[a.tier]}>{a.tier.replace('_', ' ')}</StyledBadge></StyledTd><StyledTd>{a.owner}</StyledTd><StyledRH>{a.industry}</StyledRH><StyledRH>{a.engagementScore}</StyledRH><StyledRH>${a.pipeline.toLocaleString()}</StyledRH></tr>))}</tbody>
      </StyledTable>
    </StyledContainer>
  );
};
