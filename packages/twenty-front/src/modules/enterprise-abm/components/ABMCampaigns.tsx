import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { ABMCampaignData } from '../types/abm.types';
import { GET_ABM_ANALYTICS } from '../hooks/useABM';

const StyledContainer = styled.div` display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[2]}; `;
const StyledTitle = styled.h2` font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0; `;
const StyledTable = styled.table` width: 100%; border-collapse: collapse; `;
const StyledTh = styled.th` text-align: left; padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary}; border-bottom: 1px solid ${themeCssVariables.border.color.medium}; `;
const StyledTd = styled.td` padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light}; `;
const StyledBadge = styled.span<{ variant: string }>` padding: 2px 8px; border-radius: 4px; font-size: ${themeCssVariables.font.size.xs}; background: ${({ variant }) => variant === 'active' ? themeCssVariables.color.green : variant === 'completed' ? themeCssVariables.color.blue : themeCssVariables.color.gray50}; color: ${themeCssVariables.font.color.inverted}; `;
const StyledRH = styled.td` padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light}; @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; } `;
const StyledRHH = styled.th` text-align: left; padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary}; border-bottom: 1px solid ${themeCssVariables.border.color.medium}; @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; } `;

export const ABMCampaigns = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_ABM_ANALYTICS);
  if (loading) return <StyledContainer>{t`Loading...`}</StyledContainer>;
  if (error) return <StyledContainer>{t`Error loading data`}</StyledContainer>;
  const campaigns: ABMCampaignData[] = data?.abmAnalytics?.campaigns ?? [];
  return (
    <StyledContainer>
      <StyledTitle>{t`ABM Campaigns`}</StyledTitle>
      <StyledTable>
        <thead><tr><StyledTh>{t`Campaign`}</StyledTh><StyledTh>{t`Status`}</StyledTh><StyledTh>{t`Engaged`}</StyledTh><StyledRHH>{t`Targeted`}</StyledRHH><StyledRHH>{t`Pipeline`}</StyledRHH></tr></thead>
        <tbody>{campaigns.map((c) => (<tr key={c.id}><StyledTd>{c.name}</StyledTd><StyledTd><StyledBadge variant={c.status}>{c.status}</StyledBadge></StyledTd><StyledTd>{c.engaged}/{c.accountsTargeted}</StyledTd><StyledRH>{c.accountsTargeted}</StyledRH><StyledRH>${c.pipeline.toLocaleString()}</StyledRH></tr>))}</tbody>
      </StyledTable>
    </StyledContainer>
  );
};
