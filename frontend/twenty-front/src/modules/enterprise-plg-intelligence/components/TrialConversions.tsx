import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { TrialConversionData } from '../types/plg.types';

const MOCK_FUNNEL: TrialConversionData[] = [
  { stage: 'Signed Up', count: 1200, conversionRate: 100, avgDaysInStage: 0 },
  { stage: 'Activated', count: 840, conversionRate: 70, avgDaysInStage: 1.2 },
  { stage: 'Engaged (3+ sessions)', count: 520, conversionRate: 62, avgDaysInStage: 4.5 },
  { stage: 'Aha Moment', count: 380, conversionRate: 73, avgDaysInStage: 7.0 },
  { stage: 'Converted to Paid', count: 190, conversionRate: 50, avgDaysInStage: 12.0 },
];

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

const StyledFunnelStep = styled.div`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[3]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const StyledStageLabel = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
  min-width: 160px;
`;

const StyledBarContainer = styled.div`
  flex: 1;
  height: 28px;
  background: ${themeCssVariables.background.transparent.lighter};
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  min-width: 200px;
`;

const StyledBarFill = styled.div<{ percentage: number }>`
  height: 100%;
  width: ${({ percentage }) => percentage}%;
  background: ${themeCssVariables.color.blue};
  border-radius: 4px;
  display: flex;
  align-items: center;
  padding-left: ${themeCssVariables.spacing[2]};
`;

const StyledBarLabel = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.inverted};
  white-space: nowrap;
`;

const StyledMeta = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
  min-width: 80px;
  text-align: right;
`;

export const TrialConversions = () => {
  useLingui();
  const maxCount = MOCK_FUNNEL[0].count;

  return (
    <StyledContainer>
      <StyledTitle>{t`Trial Conversion Funnel`}</StyledTitle>
      {MOCK_FUNNEL.map((step) => {
        const widthPercentage = Math.round((step.count / maxCount) * 100);
        return (
          <StyledFunnelStep key={step.stage}>
            <StyledStageLabel>{step.stage}</StyledStageLabel>
            <StyledBarContainer>
              <StyledBarFill percentage={widthPercentage}>
                <StyledBarLabel>{step.count.toLocaleString()}</StyledBarLabel>
              </StyledBarFill>
            </StyledBarContainer>
            <StyledMeta>{step.conversionRate}%</StyledMeta>
          </StyledFunnelStep>
        );
      })}
    </StyledContainer>
  );
};
