import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { FeatureUsageData } from '../types/plg.types';

const INTENSITY_COLORS: Record<string, string> = {
  low: themeCssVariables.color.gray50,
  medium: themeCssVariables.color.yellow,
  high: themeCssVariables.color.green,
};

const MOCK_USAGE: FeatureUsageData[] = [
  { featureName: 'Contact Management', category: 'Core', dailyActiveUsers: 2400, weeklyActiveUsers: 3200, adoptionRate: 95, intensity: 'high' },
  { featureName: 'Pipeline Board', category: 'Sales', dailyActiveUsers: 1800, weeklyActiveUsers: 2600, adoptionRate: 82, intensity: 'high' },
  { featureName: 'Email Integration', category: 'Communication', dailyActiveUsers: 1200, weeklyActiveUsers: 2100, adoptionRate: 68, intensity: 'medium' },
  { featureName: 'Reports Dashboard', category: 'Analytics', dailyActiveUsers: 600, weeklyActiveUsers: 1400, adoptionRate: 45, intensity: 'medium' },
  { featureName: 'API Webhooks', category: 'Developer', dailyActiveUsers: 150, weeklyActiveUsers: 280, adoptionRate: 12, intensity: 'low' },
  { featureName: 'Custom Objects', category: 'Platform', dailyActiveUsers: 320, weeklyActiveUsers: 550, adoptionRate: 22, intensity: 'low' },
];

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg};
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const StyledTh = styled.th`
  text-align: left;
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
`;

const StyledTd = styled.td`
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

const StyledIntensity = styled.span<{ color: string }>`
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background: ${({ color }) => color};
  margin-right: 6px;
  vertical-align: middle;
`;

const StyledResponsiveHide = styled.td`
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
`;

const StyledResponsiveHideHeader = styled.th`
  text-align: left;
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
`;

export const ProductUsage = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Feature Usage`}</StyledTitle>
      <StyledTable>
        <thead>
          <tr>
            <StyledTh>{t`Feature`}</StyledTh>
            <StyledTh>{t`Adoption`}</StyledTh>
            <StyledTh>{t`DAU`}</StyledTh>
            <StyledResponsiveHideHeader>{t`WAU`}</StyledResponsiveHideHeader>
            <StyledResponsiveHideHeader>{t`Intensity`}</StyledResponsiveHideHeader>
          </tr>
        </thead>
        <tbody>
          {MOCK_USAGE.map((feature) => (
            <tr key={feature.featureName}>
              <StyledTd>{feature.featureName}</StyledTd>
              <StyledTd>{feature.adoptionRate}%</StyledTd>
              <StyledTd>{feature.dailyActiveUsers.toLocaleString()}</StyledTd>
              <StyledResponsiveHide>{feature.weeklyActiveUsers.toLocaleString()}</StyledResponsiveHide>
              <StyledResponsiveHide>
                <StyledIntensity color={INTENSITY_COLORS[feature.intensity]} />
                {feature.intensity}
              </StyledResponsiveHide>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
