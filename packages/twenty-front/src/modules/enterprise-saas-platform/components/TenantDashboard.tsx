import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

const MOCK_METRICS = {
  mrr: 142500,
  activeTenants: 87,
  trialTenants: 23,
  churnRate: 2.4,
  avgRevenuePerTenant: 1638,
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg};
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: ${themeCssVariables.spacing[3]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const StyledMetricCard = styled.div`
  padding: ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StyledMetricLabel = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.tertiary};
  text-transform: uppercase;
`;

const StyledMetricValue = styled.span`
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
`;

export const TenantDashboard = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`SaaS Dashboard`}</StyledTitle>
      <StyledGrid>
        <StyledMetricCard>
          <StyledMetricLabel>{t`MRR`}</StyledMetricLabel>
          <StyledMetricValue>${MOCK_METRICS.mrr.toLocaleString()}</StyledMetricValue>
        </StyledMetricCard>
        <StyledMetricCard>
          <StyledMetricLabel>{t`Active Tenants`}</StyledMetricLabel>
          <StyledMetricValue>{MOCK_METRICS.activeTenants}</StyledMetricValue>
        </StyledMetricCard>
        <StyledMetricCard>
          <StyledMetricLabel>{t`Trials`}</StyledMetricLabel>
          <StyledMetricValue>{MOCK_METRICS.trialTenants}</StyledMetricValue>
        </StyledMetricCard>
        <StyledMetricCard>
          <StyledMetricLabel>{t`Churn Rate`}</StyledMetricLabel>
          <StyledMetricValue>{MOCK_METRICS.churnRate}%</StyledMetricValue>
        </StyledMetricCard>
        <StyledMetricCard>
          <StyledMetricLabel>{t`ARPT`}</StyledMetricLabel>
          <StyledMetricValue>${MOCK_METRICS.avgRevenuePerTenant}</StyledMetricValue>
        </StyledMetricCard>
      </StyledGrid>
    </StyledContainer>
  );
};
