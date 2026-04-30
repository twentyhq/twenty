import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { GET_SAAS_PLATFORM_DATA } from '../hooks/useSaaSPlatform';

const StyledContainer = styled.div` display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[3]}; `;
const StyledTitle = styled.h2` font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0; `;
const StyledGrid = styled.div` display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: ${themeCssVariables.spacing[3]}; @media (max-width: ${MOBILE_VIEWPORT}px) { grid-template-columns: 1fr 1fr; } `;
const StyledMetricCard = styled.div` padding: ${themeCssVariables.spacing[3]}; border: 1px solid ${themeCssVariables.border.color.light}; border-radius: 8px; display: flex; flex-direction: column; gap: 4px; `;
const StyledMetricLabel = styled.span` font-size: ${themeCssVariables.font.size.xs}; color: ${themeCssVariables.font.color.tertiary}; text-transform: uppercase; `;
const StyledMetricValue = styled.span` font-size: ${themeCssVariables.font.size.xl}; font-weight: ${themeCssVariables.font.weight.medium}; color: ${themeCssVariables.font.color.primary}; `;

export const TenantDashboard = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_SAAS_PLATFORM_DATA);
  if (loading) return <StyledContainer>{t`Loading...`}</StyledContainer>;
  if (error) return <StyledContainer>{t`Error loading data`}</StyledContainer>;
  const metrics = data?.saasplatformData ?? {};
  return (
    <StyledContainer>
      <StyledTitle>{t`SaaS Dashboard`}</StyledTitle>
      <StyledGrid>
        <StyledMetricCard><StyledMetricLabel>{t`MRR`}</StyledMetricLabel><StyledMetricValue>${(metrics.mrr ?? 0).toLocaleString()}</StyledMetricValue></StyledMetricCard>
        <StyledMetricCard><StyledMetricLabel>{t`Active Tenants`}</StyledMetricLabel><StyledMetricValue>{metrics.activeTenants ?? 0}</StyledMetricValue></StyledMetricCard>
        <StyledMetricCard><StyledMetricLabel>{t`Trials`}</StyledMetricLabel><StyledMetricValue>{metrics.trialTenants ?? 0}</StyledMetricValue></StyledMetricCard>
        <StyledMetricCard><StyledMetricLabel>{t`Churn Rate`}</StyledMetricLabel><StyledMetricValue>{metrics.churnRate ?? 0}%</StyledMetricValue></StyledMetricCard>
        <StyledMetricCard><StyledMetricLabel>{t`ARPT`}</StyledMetricLabel><StyledMetricValue>${metrics.avgRevenuePerTenant ?? 0}</StyledMetricValue></StyledMetricCard>
      </StyledGrid>
    </StyledContainer>
  );
};
